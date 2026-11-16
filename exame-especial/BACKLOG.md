# BACKLOG — melhorias observadas e NÃO aplicadas

O projeto reproduz o HTML original 1:1 (veja `npm test`). Nada abaixo foi alterado no código.
Ao aplicar um item que mude template, CSS ou script, registre a justificativa em
`tools/verify-fidelity.mjs` (`JUSTIFIED_DIFFERENCES`; no CSS, arquivo novo no fim de
`src/styles/` + `JUSTIFIED_CSS_FILES`), senão o teste falha.
Itens só de texto (config) não afetam o teste.

Esforço: **P** até 30 min · **M** até 2 h · **G** mais de 2 h.

## Conteúdo visível ao aluno

| # | Onde (arquivo → trecho) | O que e por quê | Esforço |
|---|---|---|---|
| 1 | `config/global.config.mjs` → `bootcamp.hint`: "Este campo deve ser preenchido automaticamente conforme o exame adquirido." | Instrução interna de produção aparecendo para o aluno, logo abaixo do nome do bootcamp. Basta `hint: ''` (o template já omite a linha). | P |
| 2 | `config/global.config.mjs` → `form.placeholderCode`: "CONFIGURAR: GOOGLE_FORM_EMBED_URL" e `form.placeholderText` | Se uma página for publicada sem formulário, o aluno vê um código técnico que cita uma constante que nem existe mais (agora é `form.embedUrl`). Trocar por orientação ao aluno ou impedir publicação sem link (`check:strict`). | P |
| 3 | `support.pendingTitle` ("Link do suporte pendente de configuração") + `src/template/date.mjs` | Sem link de suporte, o aluno vê um botão inerte e, ao passar o mouse, um aviso técnico. Esconder o bloco ou mostrar um canal alternativo quando `support.url` estiver vazio. | M |
| 4 | `hero.illustrationLabel`: "…caderno de estudos…" | A ilustração não tem caderno (calendário, cartão com check e uma linha). Descrição imprecisa para leitores de tela. | P |
| 5 | `page.title`: "Seu Exame Especial \| XP Educação" | Igual em todas as páginas; incluir `{bootcamp}` diferencia abas e histórico. | P |
| 6 | `faq.items[5].answer` repete "Consultar os polos disponíveis e endereços" (= `poloSection.panelTitle`) | Se o título do painel mudar, a resposta fica desatualizada. Criar o valor `{panelTitle}` em `tools/lib/text.mjs`. | P |
| 7 | Página sem horário da prova (só "será informado pelos canais oficiais") | Quando houver horário, um campo opcional `exam.time` evita editar 3 textos. | P |

## Acessibilidade

| # | Onde | O que e por quê | Esforço |
|---|---|---|---|
| 8 | `src/scripts/page.js` (estado pendente do suporte) | O link desabilitado (`aria-disabled`, `href="#"`) continua recebendo foco pelo teclado. Adicionar `tabindex="-1"` no estado pendente. | P |
| 9 | `src/template/date.mjs` → botão "Falar com o Suporte ↗" | Abre nova aba sem avisar quem usa leitor de tela. Incluir "(abre em nova aba)" visualmente oculto. | P |
| 10 | `bootcamp.label`: "EXAME ESPECIAL REFERENTE AO BOOTCAMP" | Caixa alta digitada pode ser soletrada por leitores de tela. Escrever normal e usar `text-transform: uppercase` (como já faz `.eyebrow`). | P |
| 11 | `src/styles/01-base.css` → `html { scroll-behavior: smooth; }` | Sem respeitar `prefers-reduced-motion`. | P |

## Técnico / visual

| # | Onde | O que e por quê | Esforço |
|---|---|---|---|
| 12 | `src/styles/01-base.css` e `02-base-responsivo.css` | CSS sem uso (sobras de uma versão com cabeçalho e formulário próprio): `header`, `header span`, `header small`, `.form-area`, `label`, `input[type=text], input[type=email], select`, `input:focus, select:focus`, `.form-grid` (inclusive no `@media`), `.check`, `.check label`, `.check input`, `.status`, `.button:disabled`. Conferido no navegador: nenhum elemento usa. | P |
| 13 | `src/template/date.mjs`, `polo.mjs`, `tips.mjs` | Estilos inline (`style="margin-top:12px"` ×3, `style="margin-bottom:0"`). Mover para classes no CSS. | P |
| 14 | `src/styles/03-polos-formulario.css` → `.google-form-frame { min-height: 800px }` (1000px no celular) | O iframe do Google Forms não se ajusta ao conteúdo: sobra espaço ou aparece rolagem dupla dentro do iframe do D2L. Tornar a altura configurável por página (`form.height`). | M |
| 15 | `src/template/document.mjs` (`<head>`) | As outras páginas do repositório usam `<meta name="robots" content="noindex">` e `<link rel="icon" href="data:,">`. Evita indexação de página pós-compra e o pedido de `/favicon.ico` que dá 404. | P |
| 16 | Estado pendente sem JavaScript | Sem JS o botão de suporte pendente parece ativo (igual ao original). Um `<noscript>` ou o estado desabilitado já no HTML resolve. | P |
| 17 | `src/template/document.mjs` → comentário "GERADO…" antes do `<!doctype>` | Pedido do projeto; os navegadores ignoram (conferido: modo padrão `CSS1Compat`), mas validadores HTML apontam. Se incomodar, mover para logo depois do doctype. | P |
| 18 | `https://…/exame-especial/` (sem página) | Cai no 404 genérico do site. Um `index.html` neutro, como o da raiz, orientaria quem chegar ali. | P |

## Integração com D2L e Google Forms

| # | Onde | O que e por quê | Esforço |
|---|---|---|---|
| 19 | Formulário dentro do iframe do D2L | Formulários que exigem login Google ("Restringir a usuários…", "Limitar a 1 resposta") podem não abrir em iframe dentro de iframe, por bloqueio de cookies de terceiros. Adicionar um link "Abrir o formulário em nova aba" abaixo do iframe. | P |
| 20 | `bootcamp.name` × Google Forms | Pré-preencher o bootcamp no formulário (`?usp=pp_url&entry.<id>=<nome>`), gerado pelo build a partir de `bootcamp.name`, evita resposta com bootcamp errado. | M |
| 21 | Botão "Escolher meu polo ↓" (`#polo`) | Se o D2L ajustar a altura do iframe ao conteúdo (sem rolagem interna), a âncora não rola a página do D2L, e resolver exigiria acessar a janela de cima (proibido aqui). Testar no D2L real; se acontecer, trocar o texto do botão por uma orientação. | P (teste) |
| 22 | `dateSection.supportButton`: "Falar com o Suporte ↗" | A seta ↗ não existe na Lato (recorte latino) e aparece com a fonte do sistema; o botão fica 2px mais alto que o do topo. Trocar por "(abre em nova aba)" (junta com o #9) ou por um ícone SVG. | P |
