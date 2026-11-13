/**
 * npm test — testes das regras do hub (rodam também dentro do npm run check).
 * Usam configs montadas aqui e a demo em tools/fixtures/, nunca a config real.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { loadConfig, validateConfig } from './lib/config.mjs';
import { PROJECT_DIR } from './lib/project.mjs';
import { renderPage } from './lib/render.mjs';
import { generateSite } from './lib/site.mjs';
import { courseCountIn, makeInitials } from './lib/text.mjs';

const imagesDir = join(PROJECT_DIR, 'imagens');
const DEMO = join(PROJECT_DIR, 'tools', 'fixtures', 'demo.config.mjs');

function baseConfig(overrides = {}) {
  return {
    d2l: { endereco: 'https://exemplo.brightspace.com', abrirEm: '_top' },
    marca: { nome: 'XP Inc.', logo: '' },
    textos: {
      tituloAba: 'Hub',
      rotulo: '',
      titulo: 'Escolha o seu time',
      subtitulo: '',
      botao: 'Acessar home',
      emBreve: 'Em breve',
      rodape: '',
    },
    busca: { aPartirDe: 3, placeholder: 'Buscar time' },
    ordem: 'alfabetica',
    times: [
      { nome: 'Tecnologia', home: 101 },
      { nome: 'Ética e Conduta', home: '/d2l/home/202' },
      { nome: 'Atendimento', home: '' },
    ],
    ...overrides,
  };
}

const validate = (config) => validateConfig(config, { imagesDir });
const errorsOf = (result) => result.issues.filter((issue) => issue.level === 'erro');
const warningsOf = (result) => result.issues.filter((issue) => issue.level === 'aviso');

test('monta o link da home a partir do número ou do caminho /d2l/', () => {
  const { data } = validate(baseConfig());
  const urls = Object.fromEntries(data.times.map((team) => [team.nome, team.url]));
  assert.equal(urls.Tecnologia, 'https://exemplo.brightspace.com/d2l/home/101');
  assert.equal(urls['Ética e Conduta'], 'https://exemplo.brightspace.com/d2l/home/202');
  assert.equal(urls.Atendimento, null);
});

test('ordena em ordem alfabética do português (acento não joga o time para o fim)', () => {
  const { data } = validate(baseConfig());
  assert.deepEqual(
    data.times.map((team) => team.nome),
    ['Atendimento', 'Ética e Conduta', 'Tecnologia'],
  );
});

test('ordem manual mantém a ordem da lista', () => {
  const { data } = validate(baseConfig({ ordem: 'manual' }));
  assert.deepEqual(
    data.times.map((team) => team.nome),
    ['Tecnologia', 'Ética e Conduta', 'Atendimento'],
  );
});

test('time sem home vira "Em breve" com aviso, sem erro', () => {
  const result = validate(baseConfig());
  assert.equal(errorsOf(result).length, 0);
  assert.match(warningsOf(result)[0].message, /Atendimento/);
});

test('sem endereço do D2L, times com número ficam "Em breve" e o aviso aponta o campo', () => {
  const result = validate(baseConfig({ d2l: { endereco: '', abrirEm: '_top' } }));
  assert.equal(errorsOf(result).length, 0);
  assert.ok(result.data.times.every((team) => team.url === null));
  assert.ok(warningsOf(result).some((issue) => issue.field === 'd2l → endereco'));
});

test('recusa campos que listam ou contam cursos', () => {
  for (const field of ['cursos', 'totalDeCursos', 'trilhas', 'catálogo']) {
    const config = baseConfig();
    config.times[0] = { nome: 'Tecnologia', home: 101, [field]: ['Python'] };
    const errors = errorsOf(validate(config));
    assert.equal(errors.length, 1, field);
    assert.match(errors[0].message, /só times/, field);
  }
});

test('recusa textos que contam cursos', () => {
  const config = baseConfig();
  config.times[0] = { nome: 'Tecnologia', home: 101, descricao: 'Mais de 120 cursos de engenharia.' };
  config.textos.subtitulo = 'São +300 trilhas no total.';
  const errors = errorsOf(validate(config));
  assert.equal(errors.length, 2);
  assert.ok(errors.every((issue) => /quantidade de cursos/.test(issue.message)));
  assert.equal(courseCountIn('Formação contínua para o relacionamento com clientes.'), null);
  assert.equal(courseCountIn('1.200 conteúdos'), '1.200 conteúdos');
});

test('recusa http://, endereço com caminho e campos com erro de digitação', () => {
  const config = baseConfig({ d2l: { endereco: 'https://exemplo.brightspace.com/d2l/home', abrirEm: '_top' } });
  config.times[0] = { nome: 'Tecnologia', home: 'http://exemplo.brightspace.com/d2l/home/1', descricão: 'x' };
  const messages = errorsOf(validate(config)).map((issue) => `${issue.field}: ${issue.message}`);
  assert.equal(messages.length, 3, messages.join('\n'));
  assert.ok(messages.some((m) => m.startsWith('d2l → endereco')));
  assert.ok(messages.some((m) => /home: .*https:\/\//.test(m)));
  assert.ok(messages.some((m) => /descricão: Este campo não existe/.test(m)));
});

test('endereço do D2L inválido dá só o erro (sem o aviso de campo vazio)', () => {
  const result = validate(baseConfig({ d2l: { endereco: 'http://exemplo.brightspace.com', abrirEm: '_top' } }));
  const onBase = result.issues.filter((issue) => issue.field === 'd2l → endereco');
  assert.deepEqual(onBase.map((issue) => issue.level), ['erro']);
});

test('erro de digitação na config informa a linha', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'hub-times-'));
  try {
    const file = join(dir, 'quebrada.config.mjs');
    writeFileSync(file, "export default {\n  times: [\n    { nome: 'A' }\n    { nome: 'B' },\n  ],\n};\n");
    const loaded = await loadConfig(file);
    assert.equal(loaded.ok, false);
    assert.equal(loaded.issue.field, 'linha 4');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('recusa nomes repetidos, ignorando acento e maiúsculas', () => {
  const config = baseConfig();
  config.times.push({ nome: 'ETICA E CONDUTA', home: 303 });
  const errors = errorsOf(validate(config));
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /Repete o nome/);
});

test('recusa HTML nos textos', () => {
  const config = baseConfig();
  config.times[0] = { nome: 'Tecnologia <b>nova</b>', home: 101 };
  assert.match(errorsOf(validate(config))[0].message, /HTML/);
});

test('gera siglas legíveis e respeita a sigla informada', () => {
  assert.equal(makeInitials('Assessoria de Investimentos'), 'AI');
  assert.equal(makeInitials('Dados e Analytics'), 'DA');
  assert.equal(makeInitials('Liderança'), 'LI');
  assert.equal(makeInitials('Ética'), 'ÉT');
  const config = baseConfig();
  config.times[0] = { nome: 'Tecnologia', home: 101, sigla: 'ti' };
  const team = validate(config).data.times.find((t) => t.nome === 'Tecnologia');
  assert.equal(team.sigla, 'TI');
});

test('busca ignora acentos e aceita palavras-chave', () => {
  const config = baseConfig();
  config.times[0] = { nome: 'Tecnologia', home: 101, palavrasChave: ['TI', 'Segurança'] };
  const team = validate(config).data.times.find((t) => t.nome === 'Tecnologia');
  assert.match(team.busca, /\bseguranca\b/);
  assert.match(team.busca, /\bti\b/);
});

test('a busca só aparece a partir do número configurado', () => {
  assert.equal(validate(baseConfig()).data.busca.ativa, true);
  assert.equal(validate(baseConfig({ busca: { aPartirDe: 4, placeholder: 'Buscar' } })).data.busca.ativa, false);
  assert.equal(validate(baseConfig({ busca: { aPartirDe: 0, placeholder: 'Buscar' } })).data.busca.ativa, false);
});

test('escapa caracteres especiais dos textos no HTML', () => {
  const config = baseConfig();
  config.times[0] = { nome: 'P&D "Labs"', home: 101 };
  const { data } = validate(config);
  const html = renderPage({ data, css: '', cssHash: 'sha256-x', script: '' });
  assert.match(html, /P&amp;D &quot;Labs&quot;|P&amp;D "Labs"/);
  assert.doesNotMatch(html, /P&D/);
});

test('links em nova aba levam rel="noopener noreferrer" e aviso para leitor de tela', () => {
  const { data } = validate(baseConfig({ d2l: { endereco: 'https://exemplo.brightspace.com', abrirEm: '_blank' } }));
  const html = renderPage({ data, css: '', cssHash: 'sha256-x', script: '' });
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /abre em nova aba/);
});

test('logo de time: arquivo precisa existir em imagens/ e não pode ter pasta no nome', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hub-imagens-'));
  try {
    writeFileSync(join(dir, 'logo-academy.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
    const config = baseConfig();
    config.times = [
      { nome: 'Academy', home: 1, logo: 'logo-academy.svg' },
      { nome: 'Atendimento', home: 2, logo: 'nao-existe.png' },
      { nome: 'Gente e Cultura', home: 3, logo: '../segredo.svg' },
    ];
    const result = validateConfig(config, { imagesDir: dir });
    const errors = errorsOf(result).map((issue) => `${issue.field}: ${issue.message}`);
    assert.equal(errors.length, 2, errors.join('\n'));
    assert.ok(errors.some((m) => /Atendimento.*logo: O arquivo imagens\/nao-existe\.png não existe/.test(m)));
    assert.ok(errors.some((m) => /Gente e Cultura.*logo: Precisa ser só o nome/.test(m)));
    assert.equal(result.data.times.find((t) => t.nome === 'Academy').logo, 'logo-academy.svg');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('sem logo da marca, o topo não mostra nada no lugar dele', () => {
  const { data } = validate(baseConfig());
  const html = renderPage({ data, css: '', cssHash: 'sha256-x', script: '' });
  assert.doesNotMatch(html, /class="marca/);
  assert.doesNotMatch(html, /class="topo/);
});

test('com logo, o card mostra a imagem (decorativa); sem logo, mostra a sigla', () => {
  const { data } = validate(baseConfig());
  data.times[0].logoSrc = 'assets/img/logo.svg?v=abc';
  const html = renderPage({ data, css: '', cssHash: 'sha256-x', script: '' });
  assert.match(html, /<img class="time__logo-img" src="assets\/img\/logo\.svg\?v=abc" alt="" /);
  assert.equal((html.match(/class="time__sigla"/g) ?? []).length, data.times.length - 1);
});

test('muitos times ligam a busca (e o script); poucos times esticam a grade', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'hub-muitos-'));
  try {
    const config = baseConfig({ busca: { aPartirDe: 8, placeholder: 'Buscar time' } });
    config.times = Array.from({ length: 8 }, (_, i) => ({ nome: `Time ${String.fromCharCode(65 + i)}`, home: 100 + i }));
    const file = join(dir, 'muitos.config.mjs');
    writeFileSync(file, `export default ${JSON.stringify(config)};\n`);
    const site = await generateSite({ configFile: file });
    assert.equal(site.ok, true, JSON.stringify(site.issues, null, 2));
    assert.match(site.html, /<script src="assets\/hub\.js\?v=[0-9a-f]{10}" defer><\/script>/);
    assert.ok(site.files.has('assets/hub.js'));
    assert.match(site.html, /class="times__grade" id="lista-times"/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a página da demo: hash do CSS confere com a CSP, logos publicados, links no _top e nada sobre cursos', async () => {
  const site = await generateSite({ configFile: DEMO });
  assert.equal(site.ok, true, JSON.stringify(site.issues, null, 2));

  const style = site.html.match(/<style>([\s\S]*?)<\/style>/)[1];
  const hash = createHash('sha256').update(style, 'utf8').digest('base64');
  assert.ok(site.html.includes(`style-src 'sha256-${hash}'`), 'o hash da CSP precisa bater com o <style>');

  assert.equal((site.html.match(/class="time__link"/g) ?? []).length, 3);
  assert.equal((site.html.match(/target="_top"/g) ?? []).length, 3);
  assert.equal((site.html.match(/class="time__logo-img"/g) ?? []).length, 2);
  assert.match(site.html, /<header class="hero">\s*<div class="hero__conteudo">\s*<p class="marca"><img class="marca__logo" src="assets\/img\/exemplo-logo-marca\.svg\?v=[0-9a-f]{10}" alt="XP Inc\." \/><\/p>/);
  assert.doesNotMatch(site.html, /class="topo/, 'sem barra branca no topo');
  assert.ok(site.files.has('assets/img/exemplo-logo-time.svg'));
  assert.ok(site.files.has('assets/img/exemplo-logo-marca.svg'));
  assert.match(site.html, /class="times__grade times__grade--fixa"/);
  assert.doesNotMatch(site.html, /<script/, '3 times: sem busca, sem script');
  assert.doesNotMatch(site.html, /\bcursos?\b/i);
});
