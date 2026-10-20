// Lê os parâmetros enviados pelo D2L (de preferência no #fragmento, que não vai para o servidor),
// mostra se cada cadeia foi substituída e apaga os valores do endereço. Nada é enviado nem salvo.

/** Parâmetros sugeridos: nome na URL → cadeia de substituição do D2L. */
const EXPECTED = [
  ['userId', '{UserId}', 'ID do usuário atual'],
  ['firstName', '{FirstName}', 'Nome do usuário'],
  ['lastName', '{LastName}', 'Sobrenome do usuário'],
  ['orgUnitId', '{OrgUnitId}', 'ID da unidade organizacional atual'],
  ['orgUnitName', '{OrgUnitName}', 'Nome da unidade organizacional'],
  ['roleName', '{RoleName}', 'Função do usuário na unidade atual'],
];
const LITERAL_STRING = /^\{[A-Za-z]+\}$/;

function readParams() {
  const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const fromQuery = new URLSearchParams(window.location.search);
  const params = new Map();
  for (const [key, value] of fromQuery) params.set(key, { value, source: '?' });
  for (const [key, value] of fromHash) params.set(key, { value, source: '#' }); // # tem prioridade
  return params;
}

function classify(value) {
  if (value === undefined) return ['Não enviado', 'missing'];
  if (LITERAL_STRING.test(value.trim())) return ['Não substituída', 'literal'];
  if (value.trim() === '') return ['Substituída por vazio', 'empty'];
  return ['Substituída', 'ok'];
}

function cell(text, className) {
  const td = document.createElement('td');
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function render(params) {
  const rows = document.getElementById('rows');
  const known = new Set(EXPECTED.map(([key]) => key));
  const entries = [
    ...EXPECTED.map(([key, string, label]) => ({ key, string, label, received: params.get(key) })),
    ...[...params.keys()]
      .filter((key) => !known.has(key))
      .map((key) => ({ key, string: '—', label: 'parâmetro extra', received: params.get(key) })),
  ];

  let substituted = 0;
  let literal = 0;
  for (const { key, string, label, received } of entries) {
    const [result, kind] = classify(received?.value);
    if (kind === 'ok' || kind === 'empty') substituted += 1;
    if (kind === 'literal') literal += 1;

    const tr = document.createElement('tr');
    const name = cell(key);
    name.title = label;
    tr.append(name, cell(string, 'mono'), cell(received ? received.value || '(vazio)' : '—', 'mono'));
    const status = cell('');
    const pill = document.createElement('span');
    pill.className = `pill ${kind}`;
    pill.textContent = result;
    status.append(pill);
    tr.append(status);
    rows.append(tr);
  }

  const summary = document.getElementById('summary');
  if (params.size === 0) {
    summary.textContent = 'Nenhum parâmetro recebido. Abra esta página pelo widget ou link do D2L.';
    summary.dataset.kind = 'missing';
  } else if (literal > 0 && substituted === 0) {
    summary.textContent = 'O D2L NÃO substituiu as cadeias neste lugar: os valores chegaram literais.';
    summary.dataset.kind = 'literal';
  } else if (literal > 0) {
    summary.textContent = `${substituted} cadeia(s) substituída(s) e ${literal} não substituída(s).`;
    summary.dataset.kind = 'partial';
  } else {
    summary.textContent = `Funcionou: ${substituted} cadeia(s) substituída(s) pelo D2L.`;
    summary.dataset.kind = 'ok';
  }

  const sources = new Set([...params.values()].map((item) => item.source));
  document.getElementById('ctx-source').textContent =
    sources.size === 0
      ? '—'
      : [...sources].map((s) => (s === '#' ? '# (fragmento, não vai ao servidor)' : '? (consulta, vai ao servidor)')).join(' e ');

  let inIframe;
  try {
    inIframe = window.self !== window.top;
  } catch {
    inIframe = true;
  }
  document.getElementById('ctx-iframe').textContent = inIframe ? 'Sim' : 'Não';
}

function renderSnippets() {
  const base = `${window.location.origin}${window.location.pathname}`;
  const hash = EXPECTED.map(([key, string]) => `${key}=${string}`).join('&');
  const url = `${base}#${hash}`;
  document.getElementById('snippet-url').textContent = url;
  document.getElementById('snippet-widget').textContent =
    `<iframe src="${url}" title="Teste das cadeias" width="100%" height="640" style="border:0"></iframe>`;
}

const params = readParams();
render(params);
renderSnippets();

// Tira os valores do endereço (histórico, favoritos, prints da barra de endereço).
if (params.size > 0) {
  window.history.replaceState(null, '', window.location.pathname);
}
