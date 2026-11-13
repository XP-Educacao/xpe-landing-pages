/**
 * Impressão dos problemas em pt-BR, sem cores (funciona em qualquer terminal, inclusive no GitHub).
 */

export function printIssues(issues, fileLabel) {
  const ordered = [
    ...issues.filter((issue) => issue.level === 'erro'),
    ...issues.filter((issue) => issue.level === 'aviso'),
  ];
  for (const issue of ordered) {
    const label = issue.level === 'erro' ? '✘ ERRO ' : '⚠ AVISO';
    const where = [issue.file ?? fileLabel, issue.field].filter(Boolean).join(' → ');
    console.log(`${label} ${where}`);
    console.log(`        ${issue.message}`);
    if (issue.fix) console.log(`        Como corrigir: ${issue.fix}`);
  }
  return {
    errors: issues.filter((issue) => issue.level === 'erro').length,
    warnings: issues.filter((issue) => issue.level === 'aviso').length,
  };
}

/** "8 times · 6 com link · 2 em breve · busca ativa" */
export function summary(data) {
  const total = data.times.length;
  const linked = data.times.filter((team) => team.url).length;
  const parts = [`${total} ${total === 1 ? 'time' : 'times'}`, `${linked} com link`, `${total - linked} em breve`];
  if (data.busca.ativa) parts.push('busca ativa');
  return parts.join(' · ');
}
