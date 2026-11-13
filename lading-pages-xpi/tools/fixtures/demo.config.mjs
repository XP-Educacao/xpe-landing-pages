/**
 * Config de DEMONSTRAÇÃO e de teste (nunca é publicada).
 * Mostra os 3 times com links ativos e os espaços de logo preenchidos com imagens de exemplo
 * (pasta tools/fixtures/imagens/); o time sem logo mostra a sigla no lugar:
 *   npm run preview -- --config tools/fixtures/demo.config.mjs
 *
 * O domínio exemplo.brightspace.com e os números das homes são fictícios.
 */
export default {
  d2l: { endereco: 'https://exemplo.brightspace.com', abrirEm: '_top' },
  marca: { nome: 'XP Inc.', logo: 'exemplo-logo-marca.svg' },
  textos: {
    tituloAba: 'Times da XP Inc. no D2L',
    rotulo: 'Hub de times · D2L Brightspace',
    titulo: 'Escolha o seu time',
    subtitulo: 'Cada time da XP Inc. tem uma home própria no D2L. Selecione o seu para continuar.',
    botao: 'Acessar home',
    emBreve: 'Em breve',
    rodape: 'Não encontrou o seu time? Procure a pessoa responsável pelos treinamentos da sua área.',
  },
  busca: { aPartirDe: 8, placeholder: 'Buscar time' },
  ordem: 'alfabetica',
  times: [
    { nome: 'Academy', home: 1001, logo: 'exemplo-logo-time.svg', descricao: 'Espaço para uma frase opcional sobre o time (até 120 caracteres).' },
    { nome: 'Atendimento', home: '/d2l/home/1002', descricao: 'Sem logo, o card mostra a sigla do time.' },
    { nome: 'Gente e Cultura', home: 'https://exemplo.brightspace.com/d2l/home/1003', logo: 'exemplo-logo-time.svg' },
  ],
};
