/**
 * Leitor de CSS mínimo (sem dependências), usado pelo teste de fidelidade e pelo check.
 *
 * Entende o que o projeto usa: regras, comentários, @media com regras dentro, @font-face e
 * strings ('+', "", '−'). Não é um parser completo de CSS, e não precisa ser.
 */

function skipString(css, start) {
  const quote = css[start];
  let i = start + 1;
  while (i < css.length && css[i] !== quote) i += css[i] === '\\' ? 2 : 1;
  return i + 1;
}

function splitDeclarations(body) {
  const parts = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if (ch === '"' || ch === "'") {
      const end = skipString(body, i);
      current += body.slice(i, end);
      i = end - 1;
    } else if (ch === '(') {
      depth += 1;
      current += ch;
    } else if (ch === ')') {
      depth -= 1;
      current += ch;
    } else if (ch === ';' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const colon = part.indexOf(':');
      if (colon === -1) throw new Error(`Declaração CSS sem ":" → "${part}"`);
      return { prop: part.slice(0, colon).trim(), value: part.slice(colon + 1).trim() };
    });
}

/** Lê o CSS e devolve uma lista de nós: comment | rule | at (ex.: @media com filhos). */
export function parseCss(css) {
  let i = 0;

  function readBody() {
    let depth = 0;
    let body = '';
    while (i < css.length) {
      const ch = css[i];
      if (ch === '"' || ch === "'") {
        const end = skipString(css, i);
        body += css.slice(i, end);
        i = end;
        continue;
      }
      if (ch === '/' && css[i + 1] === '*') {
        i = css.indexOf('*/', i + 2) + 2;
        continue;
      }
      if (ch === '{') depth += 1;
      if (ch === '}') {
        if (depth === 0) {
          i += 1;
          return body;
        }
        depth -= 1;
      }
      body += ch;
      i += 1;
    }
    throw new Error('CSS terminou sem fechar uma chave "}".');
  }

  function readList(insideBlock) {
    const nodes = [];
    let buffer = '';
    while (i < css.length) {
      const ch = css[i];
      if (ch === '/' && css[i + 1] === '*') {
        const end = css.indexOf('*/', i + 2);
        if (end === -1) throw new Error('Comentário CSS sem "*/".');
        if (buffer.trim() === '') nodes.push({ type: 'comment', text: css.slice(i, end + 2) });
        i = end + 2;
        continue;
      }
      if (ch === '"' || ch === "'") {
        const end = skipString(css, i);
        buffer += css.slice(i, end);
        i = end;
        continue;
      }
      if (ch === '{') {
        const prelude = buffer.trim();
        buffer = '';
        i += 1;
        if (/^@font-face\b/i.test(prelude)) {
          // @font-face tem declarações (como uma regra), não regras dentro.
          nodes.push({ type: 'rule', selector: prelude, declarations: splitDeclarations(readBody()) });
        } else if (prelude.startsWith('@')) {
          nodes.push({ type: 'at', prelude, children: readList(true) });
        } else {
          nodes.push({ type: 'rule', selector: prelude, declarations: splitDeclarations(readBody()) });
        }
        continue;
      }
      if (ch === '}') {
        if (!insideBlock) throw new Error('"}" sobrando no CSS.');
        i += 1;
        return nodes;
      }
      buffer += ch;
      i += 1;
    }
    if (insideBlock) throw new Error('Bloco @ sem "}" de fechamento.');
    if (buffer.trim() !== '') throw new Error(`Trecho CSS sem regra: "${buffer.trim()}"`);
    return nodes;
  }

  return readList(false);
}

const squash = (text) => text.replace(/\s+/g, ' ').trim();

/**
 * Achata o CSS em uma lista ordenada de regras normalizadas (ignora comentários e espaços).
 * Ex.: "@media(max-width:760px) | .hero | grid-template-columns:1fr; padding:28px"
 */
export function flattenCss(css) {
  const out = [];
  const walk = (nodes, context) => {
    for (const node of nodes) {
      if (node.type === 'rule') {
        const declarations = node.declarations.map((d) => `${d.prop}:${squash(d.value)}`).join('; ');
        out.push(`${context}${squash(node.selector)} { ${declarations} }`);
      } else if (node.type === 'at') {
        walk(node.children, `${context}${squash(node.prelude)} → `);
      }
    }
  };
  walk(parseCss(css), '');
  return out;
}

/** Reescreve nós de CSS em formato legível (uma declaração por linha), sem mudar valores. */
export function formatCss(nodes, indent = '') {
  return nodes
    .map((node) => {
      if (node.type === 'comment') return `${indent}${node.text}`;
      if (node.type === 'rule') {
        const lines = node.declarations.map((d) => `${indent}  ${d.prop}: ${d.value};`);
        return `${indent}${node.selector} {\n${lines.join('\n')}\n${indent}}`;
      }
      return `${indent}${node.prelude} {\n${formatCss(node.children, `${indent}  `)}\n${indent}}`;
    })
    .join(indent === '' ? '\n\n' : '\n\n');
}
