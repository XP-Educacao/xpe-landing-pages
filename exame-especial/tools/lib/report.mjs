/**
 * Impressão dos problemas encontrados, em pt-BR, sem cores (funciona em qualquer terminal).
 */
import { displayPath } from './project.mjs';

/** Remove repetidos (o mesmo problema da config global aparece em todas as páginas). */
export function uniqueIssues(issues) {
  const seen = new Set();
  return issues.filter((issue) => {
    const key = [issue.level, issue.file, issue.path, issue.message].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function countIssues(issues) {
  return {
    errors: issues.filter((i) => i.level === 'erro').length,
    warnings: issues.filter((i) => i.level === 'aviso').length,
  };
}

export function printIssues(issues, { only } = {}) {
  const list = uniqueIssues(issues).filter((issue) => !only || issue.level === only);
  const ordered = [...list.filter((i) => i.level === 'erro'), ...list.filter((i) => i.level === 'aviso')];
  for (const issue of ordered) {
    const label = issue.level === 'erro' ? '✘ ERRO ' : '⚠ AVISO';
    const where = issue.file ? displayPath(issue.file) : 'projeto';
    const field = issue.path ? ` → ${issue.path}` : '';
    console.log(`${label} ${where}${field}`);
    const subject = issue.sentence ? '' : issue.path ? 'O campo ' : 'O arquivo ';
    console.log(`        ${subject}${issue.message}`);
    if (issue.fix) console.log(`        Como corrigir: ${issue.fix}`);
  }
  return countIssues(list);
}
