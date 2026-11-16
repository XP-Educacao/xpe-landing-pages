/**
 * npm test — teste de fidelidade com o HTML original (reference/original.html).
 *
 * Gera uma página com a fixture (tools/fixtures/: os dados do original) e compara:
 *   (a) <body> normalizado (espaços colapsados) e o <head>;
 *   (b) o conjunto e a ordem das regras CSS (inclusive @media);
 *   (c) a lógica de URL do formulário e do suporte: o script original e o novo rodam com os
 *       mesmos casos válidos e inválidos e precisam terminar no mesmo estado.
 * Toda diferença precisa estar em JUSTIFIED_DIFFERENCES (HTML) ou JUSTIFIED_CSS_FILES (CSS);
 * diferença sem justificativa = falha.
 * Também testa datas, mesclagem de configs, escape de textos e o build das páginas atuais.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

import { FORM_EMBED_URL_PATTERN, SUPPORT_URL_PATTERN } from '../src/scripts/rules.mjs';
import { availableIcons, computeTokens, deepMerge, loadModule, resolvePage } from './lib/config.mjs';
import { flattenCss } from './lib/css.mjs';
import { deriveDate, parseIsoDate } from './lib/dates.mjs';
import { GLOBAL_CONFIG_FILE, PROJECT_DIR, REFERENCE_FILE, slugProblem } from './lib/project.mjs';
import { buildAssets, renderPage } from './lib/render.mjs';
import { checkFormUrl, checkSupportUrl, validateConfig } from './lib/schema.mjs';
import { generateSite } from './lib/site.mjs';
import { markupProblem, renderText, unknownTokens } from './lib/text.mjs';

const REFERENCE_SHA256 = '805edadf846d95bb0efd3110ed5545e7638c5fb2c09fd5ef6707b6b84d96ef67';
const FIXTURES = join(PROJECT_DIR, 'tools', 'fixtures');

const original = readFileSync(REFERENCE_FILE, 'utf8');
const squash = (text) => text.replace(/\s+/g, ' ').trim();
const between = (text, start, end) => {
  const match = text.match(new RegExp(`${start}([\\s\\S]*)${end}`));
  assert.ok(match, `não achei ${start}…${end}`);
  return match[1];
};
const unescapeAttr = (value) =>
  value.replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');

/* ── Página gerada com os dados do original ─────────────────────────────────────────── */
const fixtureGlobal = (await loadModule(join(FIXTURES, 'original.global.mjs'))).value;
const fixturePage = await resolvePage({ configFile: join(FIXTURES, 'original.page.mjs') }, fixtureGlobal);
assert.ok(fixturePage.config, 'a fixture da página não carregou');
const assets = buildAssets();
const generated = renderPage(fixturePage.config, assets);

/**
 * Diferenças ACEITAS entre o original e a página gerada. Cada uma é aplicada ao original antes
 * da comparação e precisa mudar algo (exceção que não se aplica mais também falha).
 */
const JUSTIFIED_DIFFERENCES = [
  {
    what: 'Comentário "GOOGLE FORMS: cole a URL…" removido do corpo',
    why: 'ensinava a editar a constante no fim do HTML, que não existe mais; o link agora fica em form.embedUrl do page.config.mjs.',
    apply: (body) => body.replace(/<!-- GOOGLE FORMS:[\s\S]*?-->\s*/, ''),
  },
  {
    what: 'Atributo data-support-url no botão de suporte',
    why: 'entrega o support.url da página ao script compartilhado (no original era uma constante no script).',
    apply: (body) =>
      body.replace(/(<a id="suporteLink"[^>]*rel="noopener noreferrer")>/, '$1 data-support-url="">'),
  },
  {
    what: 'Atributos data-form-embed-url e data-form-title na área do formulário',
    why: 'entregam form.embedUrl e o título do iframe ao script compartilhado.',
    apply: (body) =>
      body.replace(
        '<div id="googleFormContainer">',
        '<div id="googleFormContainer" data-form-embed-url="" data-form-title="Formulário de escolha do polo do Exame Especial">',
      ),
  },
  {
    what: 'Script inline trocado por <script src="../assets/exame-especial.js?v=…">',
    why: 'um JS só para todas as páginas, com cache-busting por hash; mesma posição (fim do body), mesma execução síncrona.',
    apply: (body) =>
      body.replace(/<script>[\s\S]*?<\/script>/, `<script src="../assets/exame-especial.js?v=${assets.js.version}"></script>`),
  },
];

/**
 * Arquivos de src/styles/ que NÃO vêm do original (acréscimos aceitos). Os demais, juntos,
 * precisam reproduzir o CSS original regra a regra; estes vêm depois deles (prefixo maior)
 * para sobrepor sem alterar nada do original.
 */
const JUSTIFIED_CSS_FILES = [
  {
    file: '05-tipografia-lato.css',
    what: 'Página toda em Lato na escala do D2L (texto 19px; títulos 48/30/20px; apoio 16px; rótulos 14px), com a fonte servida de assets/',
    why: 'pedido em 16/11/2026: tipografia harmônica e com cara de nativa do D2L; cores, espaçamentos e layout seguem o original.',
  },
];

const HEAD_DIFFERENCES = [
  'Comentário "GERADO por tools/build" antes do <!doctype> (comentário não ativa o modo quirks).',
  '<style> inline trocado por <link rel="stylesheet" href="../assets/exame-especial.css?v=…">: CSS compartilhado com cache-busting; continua no <head> (bloqueia a renderização igual).',
  'Nome do bootcamp escrito no HTML pelo build, em vez de por JS (mesmo texto; aparece mesmo sem JS).',
];

/* ── Ambiente de DOM mínimo para rodar os scripts no Node ─────────────────────────────── */
function fakeDocument(elements) {
  const make = (tagName, attributes = {}) => ({
    tagName,
    attributes: { ...attributes },
    style: {},
    handlers: [],
    children: undefined,
    href: attributes.href,
    getAttribute(name) {
      return Object.hasOwn(this.attributes, name) ? this.attributes[name] : null;
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    removeAttribute(name) {
      delete this.attributes[name];
    },
    addEventListener(type, fn) {
      this.handlers.push({ type, fn });
    },
    replaceChildren(...nodes) {
      this.children = nodes;
    },
  });
  const byId = Object.fromEntries(Object.entries(elements).map(([id, attrs]) => [id, make('DIV', attrs)]));
  return {
    byId,
    document: { getElementById: (id) => byId[id] ?? null, createElement: (tag) => make(tag.toUpperCase()) },
  };
}

function finalState({ byId }) {
  const link = byId.suporteLink;
  let blocked = false;
  for (const h of link.handlers.filter((x) => x.type === 'click')) h.fn({ preventDefault: () => (blocked = true) });
  const container = byId.googleFormContainer;
  const iframe = container.children?.[0];
  return {
    support: {
      href: link.href,
      ariaDisabled: link.getAttribute('aria-disabled'),
      title: link.getAttribute('title'),
      opacity: link.style.opacity ?? null,
      cursor: link.style.cursor ?? null,
      clickBlocked: blocked,
    },
    form:
      iframe === undefined
        ? 'espaço reservado mantido'
        : {
            count: container.children.length,
            tag: iframe.tagName,
            className: iframe.className,
            title: iframe.title,
            src: iframe.src,
            loading: iframe.loading,
            referrerpolicy: iframe.getAttribute('referrerpolicy'),
          },
  };
}

const originalScript = between(original, '<script>', '</script>');
const supportAttrs = { href: '#', 'aria-disabled': 'true', title: 'Link do suporte pendente de configuração' };

function runOriginal(formUrl, supportUrl) {
  const code = originalScript
    .replace("const SUPORTE_URL='';", `const SUPORTE_URL=${JSON.stringify(supportUrl)};`)
    .replace("const GOOGLE_FORM_EMBED_URL='';", `const GOOGLE_FORM_EMBED_URL=${JSON.stringify(formUrl)};`);
  assert.notEqual(code, originalScript);
  const dom = fakeDocument({ bootcampNome: {}, suporteLink: supportAttrs, googleFormContainer: {} });
  vm.runInNewContext(code, { document: dom.document });
  return finalState(dom);
}

function runNew(formUrl, supportUrl) {
  const dom = fakeDocument({
    suporteLink: { ...supportAttrs, 'data-support-url': supportUrl },
    googleFormContainer: {
      'data-form-embed-url': formUrl,
      'data-form-title': 'Formulário de escolha do polo do Exame Especial',
    },
  });
  vm.runInNewContext(assets.js.content, { document: dom.document });
  return finalState(dom);
}

const FORM_CASES = [
  '',
  'https://docs.google.com/forms/d/e/1FAIpQLSf-EXEMPLO/viewform?embedded=true',
  'https://docs.google.com/forms/d/e/1FAIpQLSf-EXEMPLO/viewform?usp=pp_url&entry.1=a%20b&embedded=true',
  'HTTPS://DOCS.GOOGLE.COM/FORMS/d/e/X/viewform?embedded=true',
  'https://docs.google.com/forms/d/e/X/viewform',
  'https://docs.google.com/forms/d/ABC123/edit',
  'http://docs.google.com/forms/d/e/X/viewform?embedded=true',
  'https://forms.gle/AbCdEf123',
  'https://docs.google.com.evil.example/forms/x',
  'https://evil.example/?u=https://docs.google.com/forms/',
  ' https://docs.google.com/forms/d/e/X/viewform?embedded=true',
  'javascript:alert(1)',
  'https://docs.google.com/form/d/e/X',
];
const SUPPORT_CASES = [
  '',
  'https://suporte.exemplo.com.br/',
  'HTTPS://SUPORTE.EXEMPLO.COM.BR',
  'http://suporte.exemplo.com.br',
  'mailto:suporte@exemplo.com.br',
  'javascript:alert(1)',
  '#',
  '//suporte.exemplo.com.br',
  ' https://suporte.exemplo.com.br',
  'https://',
];

/** Onde o build é, de propósito, mais rígido que o navegador (o navegador aceitaria). */
const STRICTER_IN_BUILD = {
  'https://docs.google.com/forms/d/ABC123/edit': 'link de edição: o aluno veria "acesso negado" dentro do iframe.',
  'https://': 'https:// sem endereço: o botão abriria uma aba vazia.',
};

/* ── Testes ───────────────────────────────────────────────────────────────────────────── */
const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const notes = [];

test('reference/original.html está intacto', () => {
  const hash = createHash('sha256').update(readFileSync(REFERENCE_FILE)).digest('hex');
  assert.equal(hash, REFERENCE_SHA256, 'o arquivo de referência foi alterado; restaure-o do git.');
});

test('a fixture do original é uma config válida', () => {
  const errors = validateConfig(fixtureGlobal, { mode: 'global', icons: availableIcons() })
    .concat(fixturePage.issues)
    .filter((i) => i.level === 'erro');
  assert.deepEqual(errors, []);
});

test('(a) <body> igual ao original (espaços colapsados), com diferenças justificadas', () => {
  let expected = between(original, '<body>', '</body>');
  JUSTIFIED_DIFFERENCES.forEach((diff, index) => {
    const after = diff.apply(expected);
    assert.notEqual(after, expected, `a justificativa ${index + 1} ("${diff.what}") não se aplica mais; atualize a lista.`);
    expected = after;
  });
  const want = squash(expected);
  const got = squash(between(generated, '<body>', '</body>'));
  if (want !== got) {
    let i = 0;
    while (want[i] === got[i]) i += 1;
    const show = (s) => s.slice(Math.max(0, i - 90), i + 90);
    assert.fail(`primeira diferença no caractere ${i}:\n   original: …${show(want)}…\n   gerado:   …${show(got)}…`);
  }
  JUSTIFIED_DIFFERENCES.forEach((d, n) => notes.push(`   ${n + 1}. ${d.what} — ${d.why}`));
});

test('(a) <head>: lang, charset, viewport e título iguais', () => {
  const pick = (html) => ({
    lang: html.match(/<html lang="([^"]+)"/)?.[1],
    metas: [...between(html, '<head>', '</head>').matchAll(/<meta [^>]+>/g)].map((m) => m[0]),
    title: between(html, '<title>', '</title>'),
  });
  assert.deepEqual(pick(generated), pick(original));
  assert.ok(generated.startsWith('<!-- GERADO por tools/build — não editar; edite page.config.mjs -->\n<!doctype html>'));
  HEAD_DIFFERENCES.forEach((d) => notes.push(`   • ${d}`));
});

test('(b) CSS: mesmas regras, mesmos valores, mesma ordem (inclusive @media), com acréscimos justificados', () => {
  const names = assets.styleFiles.map((f) => f.name);
  const extras = new Set(JUSTIFIED_CSS_FILES.map((d) => d.file));
  for (const d of JUSTIFIED_CSS_FILES) {
    assert.ok(names.includes(d.file), `a justificativa de CSS "${d.file}" não se aplica mais (arquivo não existe); atualize a lista.`);
  }
  const firstExtra = names.findIndex((name) => extras.has(name));
  assert.ok(
    firstExtra === -1 || names.slice(firstExtra).every((name) => extras.has(name)),
    `os acréscimos (${[...extras].join(', ')}) precisam vir DEPOIS de todos os arquivos do original; ordem atual: ${names.join(', ')}`,
  );

  const want = flattenCss(between(original, '<style>', '</style>'));
  const base = assets.styleFiles.filter((f) => !extras.has(f.name));
  const got = flattenCss(base.map((f) => f.content).join('\n'));
  const firstDiff = want.findIndex((rule, i) => rule !== got[i]);
  assert.ok(
    firstDiff === -1 && want.length === got.length,
    `regra ${firstDiff + 1} difere:\n   original: ${want[firstDiff]}\n   gerado:   ${got[firstDiff]}\n   (original ${want.length} regras, gerado ${got.length})\n` +
      '   Se a mudança é intencional, coloque-a num arquivo novo no fim de src/styles/ e registre em JUSTIFIED_CSS_FILES.',
  );

  const total = flattenCss(assets.css.content);
  assert.deepEqual(total.slice(0, want.length), want, 'o CSS publicado não começa pelas regras do original');
  const media = want.filter((r) => r.startsWith('@media')).length;
  notes.push(`   ${want.length} regras CSS idênticas, ${media} delas dentro de @media(max-width:760px).`);
  for (const d of JUSTIFIED_CSS_FILES) {
    const count = flattenCss(assets.styleFiles.find((f) => f.name === d.file).content).length;
    notes.push(`   + ${d.file} (${count} regras): ${d.what} — ${d.why}`);
  }
});

test('(c) regras de URL iguais às do script original', () => {
  assert.ok(originalScript.includes(`if(${SUPPORT_URL_PATTERN}.test(SUPORTE_URL))`), 'regra do suporte mudou');
  assert.ok(originalScript.includes(`if(${FORM_EMBED_URL_PATTERN}.test(GOOGLE_FORM_EMBED_URL))`), 'regra do formulário mudou');
});

test(`(c) navegador: ${FORM_CASES.length * SUPPORT_CASES.length} combinações formulário × suporte iguais ao original`, () => {
  for (const formUrl of FORM_CASES) {
    for (const supportUrl of SUPPORT_CASES) {
      assert.deepEqual(runNew(formUrl, supportUrl), runOriginal(formUrl, supportUrl), `form=${JSON.stringify(formUrl)} suporte=${JSON.stringify(supportUrl)}`);
    }
  }
  const pending = runNew('', '');
  assert.equal(pending.form, 'espaço reservado mantido');
  assert.deepEqual(pending.support, { href: '#', ariaDisabled: 'true', title: supportAttrs.title, opacity: '.65', cursor: 'not-allowed', clickBlocked: true });
});

test('(c) build valida com a mesma regra do navegador', () => {
  const check = (cases, pattern, validator) => {
    for (const value of cases) {
      const browserAccepts = pattern.test(value);
      const buildError = validator(value).some((r) => r.level === 'erro');
      if (value === '') assert.equal(buildError, false, 'vazio é pendência (aviso), não erro');
      else if (!browserAccepts) assert.equal(buildError, true, `o build deveria recusar ${JSON.stringify(value)}`);
      else assert.equal(buildError, value in STRICTER_IN_BUILD, `divergência sem justificativa em ${JSON.stringify(value)}`);
    }
  };
  check(FORM_CASES, FORM_EMBED_URL_PATTERN, checkFormUrl);
  check(SUPPORT_CASES, SUPPORT_URL_PATTERN, checkSupportUrl);
  for (const [value, why] of Object.entries(STRICTER_IN_BUILD)) notes.push(`   • build mais rígido em ${JSON.stringify(value)}: ${why}`);
});

test('(c) URLs chegam ao HTML sem alteração (escape de atributo ida e volta)', () => {
  const formUrl = FORM_CASES[2];
  const supportUrl = 'https://suporte.exemplo.com.br/?a=1&b="2"';
  const html = renderPage(deepMerge(fixturePage.config, { form: { embedUrl: formUrl }, support: { url: supportUrl } }), assets);
  assert.equal(unescapeAttr(html.match(/data-form-embed-url="([^"]*)"/)[1]), formUrl);
  assert.equal(unescapeAttr(html.match(/data-support-url="([^"]*)"/)[1]), supportUrl);
});

test('datas: derivadas em UTC, pt-BR, sem erro de fuso', () => {
  assert.deepEqual(deriveDate('2026-12-16'), {
    iso: '2026-12-16',
    dateShort: '16/12/2026',
    dateLong: '16 de dezembro de 2026',
    weekday: 'Quarta-feira',
    day: '16',
    monthYearUpper: 'DEZEMBRO 2026',
  });
  assert.equal(deriveDate('2027-01-01').weekday, 'Sexta-feira');
  assert.equal(deriveDate('2027-03-07').dateShort, '07/03/2027');
  assert.equal(deriveDate('2027-03-07').monthYearUpper, 'MARÇO 2027');
  for (const bad of ['2026-02-30', '16/12/2026', '2026-12-1', '', null]) assert.equal(parseIsoDate(bad), null, String(bad));
});

test('notas e contagens saem dos dados (200, 349, 350, 40%, 69%)', () => {
  const t = computeTokens(fixturePage.config);
  assert.deepEqual(
    [t.eligibleMin, t.eligibleMax, t.eligibleMinPct, t.eligibleMaxPct, t.approvalMin, t.recordedIfApproved, t.stepsCount, t.polosCount],
    [200, 349, '40%', '69%', 350, 350, 3, 7],
  );
  for (const text of ['16/12/2026', 'DEZEMBRO 2026', '>16<', 'Quarta-feira', '200 a 349 pontos (40% a 69%)', '350 pontos ou mais']) {
    assert.ok(generated.includes(text), `"${text}" não aparece na página`);
  }
});

test('mesclagem: blocos se combinam, listas são substituídas', () => {
  const base = { a: { x: 1, y: 2 }, list: [1, 2, 3] };
  assert.deepEqual(deepMerge(base, { a: { y: 9 }, list: [7] }), { a: { x: 1, y: 9 }, list: [7] });
  assert.deepEqual(base, { a: { x: 1, y: 2 }, list: [1, 2, 3] }, 'a base não pode ser alterada');
});

test('textos: só **negrito**; HTML é escapado; {valores} desconhecidos são detectados', () => {
  assert.equal(renderText('a **b** <script>x</script> & c', {}), 'a <strong>b</strong> &lt;script&gt;x&lt;/script&gt; &amp; c');
  assert.ok(markupProblem('<strong>x</strong>', { allowBold: true }));
  assert.ok(markupProblem('**sem fim', { allowBold: true }));
  assert.ok(markupProblem('**x**', { allowBold: false }));
  assert.deepEqual(unknownTokens('em {dateShort} e {dataCurta}'), ['dataCurta']);
});

test('slugs: só minúsculas, números e hífens; nomes internos recusados', () => {
  for (const ok of ['pg-1', 'bootcamp-dados', 'a1']) assert.equal(slugProblem(ok), null, ok);
  for (const bad of ['Pg-1', 'pg_1', 'pg 1', 'pg-', '-pg', 'ação', 'assets', 'tools', '']) assert.ok(slugProblem(bad), bad);
});

test('as páginas atuais geram sem erro', async () => {
  const site = await generateSite();
  const errors = site.issues.filter((i) => i.level === 'erro');
  assert.deepEqual(errors.map((e) => `${e.path} ${e.message}`), []);
  notes.push(`   ${site.pages.length} página(s) atuais geradas: ${site.pages.map((p) => p.slug).join(', ')}.`);
});

/* ── Execução ─────────────────────────────────────────────────────────────────────────── */
console.log('Teste de fidelidade — exame-especial\n');
let failures = 0;
for (const { name, fn } of tests) {
  notes.length = 0;
  try {
    await fn();
    console.log(`✔ ${name}`);
    for (const note of notes) console.log(note);
  } catch (error) {
    failures += 1;
    console.log(`✘ ${name}\n   ${String(error.message).split('\n').join('\n   ')}`);
  }
}

// Informativo: o que a config global atual já mudou em relação ao original (não é falha).
const current = (await loadModule(GLOBAL_CONFIG_FILE)).value;
const changes = [];
const walk = (a, b, path) => {
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) walk(a[key], b[key], path ? `${path}.${key}` : key);
  } else changes.push(path);
};
walk(fixtureGlobal, current, '');
console.log(
  changes.length === 0
    ? '\nℹ config/global.config.mjs está idêntica aos dados do original.'
    : `\nℹ config/global.config.mjs mudou em relação ao original em: ${changes.join(', ')} (informativo, não é falha).`,
);

console.log(`\n${tests.length - failures} de ${tests.length} testes passaram.`);
process.exit(failures === 0 ? 0 : 1);
