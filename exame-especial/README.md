# Exame Especial · páginas por bootcamp

Páginas do Exame Especial (uma por bootcamp), geradas a partir de configuração. Mesmo visual e estrutura; muda o bootcamp, o Google Forms e o que mais for preciso. **Zero dependências**: só Node.

```
https://xp-educacao.github.io/xpe-landing-pages/exame-especial/<pasta>/
```

A **pasta é o slug**: o final da URL é exatamente o nome da pasta da página.

> Todos os comandos abaixo rodam no **PowerShell, dentro de `exame-especial`**:
> `cd C:\caminho\do\xpe-landing-pages\exame-especial`

## Tarefas comuns

### Trocar o nome do bootcamp

```powershell
notepad pg-1\page.config.mjs     # troque o texto de bootcamp.name e salve
npm run build
npm run list                     # confira o nome na coluna "bootcamp"
```

### Colocar o link do formulário

No Google Forms: **Enviar** → ícone **`<>`** → copie só o endereço que está em `src="…"` (termina com `/viewform?embedded=true`).

```powershell
notepad pg-1\page.config.mjs     # cole em form.embedUrl, entre aspas simples
npm run build
npm run list                     # "formulário ok?" deve mostrar ok
```

### Trocar o slug/URL de uma página

```powershell
npm run rename -- pg-1 bootcamp-dados --redirect
npm run list
```

`--redirect` deixa a URL antiga levando para a nova (útil se ela já está no D2L). Mesmo assim, atualize o link no D2L.

### Adicionar uma página

```powershell
npm run new -- bootcamp-dados
notepad bootcamp-dados\page.config.mjs   # preencha bootcamp.name e form.embedUrl
npm run build
```

### Adicionar ou alterar um polo

```powershell
notepad config\global.config.mjs   # em polos: copie um bloco { … }, cole no fim e troque os valores
npm run build
```

Inclua a mesma opção no Google Forms. Para uma página mostrar só alguns polos: `polos: ['sao-paulo', 'curitiba'],` no `page.config.mjs` dela.

### Mudar a data

```powershell
notepad config\global.config.mjs   # exam.date: '2027-01-20'  (ANO-MÊS-DIA)
npm run build
```

Calendário do topo, card da data, dia da semana, textos e FAQ mudam sozinhos. Só para uma página: `overrides: { exam: { date: '2027-01-20' } },` no `page.config.mjs`.

### Ajustar o tamanho dos textos

```powershell
notepad src\styles\05-tipografia-lato.css   # no bloco :root, troque --fs-texto, --fs-h3…
npm run build
npm run preview                             # confira; vale para todas as páginas
```

A escala completa está em **Convenções → Tipografia**.

### Publicar e conferir

```powershell
npm run check:strict     # precisa terminar com "✔ Tudo certo."
npm test                 # precisa terminar com "15 de 15 testes passaram."
git add -A .
git commit -m "chore(exame-especial): atualizar links das páginas"
git push
```

Acompanhe em **GitHub → Actions** (1 a 3 minutos). Depois abra cada URL de `npm run list` com **Ctrl+F5**.

### Ver no computador antes de publicar

```powershell
npm run preview          # abre um servidor local; Ctrl+C para parar
```

Mostra as páginas no mesmo caminho do GitHub Pages e uma simulação dentro de iframe, como na Home do D2L (`/__d2l/?p=pg-1`).

## Páginas

Tabela atualizada pelo `npm run build`:

<!-- PAGINAS:INICIO (gerado por npm run build — não edite entre estas linhas) -->
| Pasta (slug) | Bootcamp | Formulário | Suporte | URL publicada |
|---|---|---|---|---|
| `mer-btc2` | Mercado Financeiro e de Capitais - BTC 2 | ✔ ok | ⚠ pendente | https://xp-educacao.github.io/xpe-landing-pages/exame-especial/mer-btc2/ |
| `neg-btc1` | Negócio, Carreira e Competências do Profissional de Investimentos - BTC 1 | ✔ ok | ⚠ pendente | https://xp-educacao.github.io/xpe-landing-pages/exame-especial/neg-btc1/ |
| `pa1-btc4` | Projeto Aplicado I - BTC 4 | ✔ ok | ⚠ pendente | https://xp-educacao.github.io/xpe-landing-pages/exame-especial/pa1-btc4/ |
| `pin-btc3` | Produtos de Investimentos - BTC 3 | ✔ ok | ⚠ pendente | https://xp-educacao.github.io/xpe-landing-pages/exame-especial/pin-btc3/ |
<!-- PAGINAS:FIM -->

## Como funciona

```
 VOCÊ EDITA                                         O BUILD GERA (não edite)
 ──────────                                         ────────────────────────
 config/global.config.mjs  (dados de todas)  ─┐
 <slug>/page.config.mjs    (dados da página) ─┤     <slug>/index.html             commitado
 src/template/*.mjs        (marcação)        ─┤     assets/exame-especial.css     commitado
 src/styles/*.css          (visual)          ─┼──►  assets/exame-especial.js      commitado
 src/scripts/*             (comportamento)   ─┤     assets/lato-*.woff2           commitado
 src/icons/*.svg           (ícones)          ─┤     tabela "Páginas" do README    commitado
 src/fonts/*.woff2         (fonte Lato)      ─┘     dist/                         não commitado
                    tools/build.mjs (valida → mescla → gera)
```

Publicação (nada a configurar, já é o padrão do repositório):

```
push na main → .github/workflows/deploy.yml → scripts/build-all.mjs
  └─ exame-especial/ tem package.json → npm ci → npm run check → npm run build → publica dist/
```

Como a publicação refaz o build a partir das configs, o que vai ao ar sempre corresponde às configs, mesmo que alguém esqueça de rodar o build. Os arquivos gerados são commitados mesmo assim, para revisão no GitHub e para funcionar com qualquer forma de deploy.

```
exame-especial/
├── README.md                  este guia
├── BACKLOG.md                 melhorias observadas e ainda NÃO aplicadas
├── package.json               scripts (sem dependências); package-lock.json é exigido pelo npm ci do deploy
├── config/global.config.mjs   dados de todas as páginas: data, notas, polos, textos, FAQ…
├── pg-1/ … pg-4/              uma pasta por página: page.config.mjs (edite) + index.html (gerado)
├── src/
│   ├── template/              marcação por seção; document.mjs define a ordem das seções
│   ├── styles/                CSS do original (01 a 04) + acréscimos no fim (05-tipografia-lato.css);
│   │                          a ordem dos arquivos é a ordem da cascata
│   ├── scripts/               page.js (navegador) e rules.mjs (regras de URL, usadas também no build)
│   ├── icons/                 SVGs (livro, alvo, documento, formulario) e a ilustração do calendário
│   └── fonts/                 Lato 400, 700 e 900 (só caracteres latinos), a fonte da página
├── tools/                     build, check, list, new-page, rename-page, preview, verify-fidelity
│   ├── lib/                   núcleo: configs, validação, datas, textos, geração
│   ├── templates/             modelo do page.config.mjs usado pelo npm run new
│   └── fixtures/              dados do HTML original, usados só pelo teste (não edite)
├── reference/original.html    HTML recebido, intocado (o teste confere o hash)
└── assets/                    CSS, JS e fontes compartilhados (gerados)
```

## Convenções

**Slug.** Só minúsculas, números e hífens, sem acento (`bootcamp-dados`). Nenhum outro arquivo guarda o slug: renomear a pasta e rodar o build basta, porque todos os caminhos são relativos (`../assets/…`). Use `npm run rename` para que a tabela e os redirecionamentos acompanhem. Nomes reservados: `assets`, `config`, `dist`, `node_modules`, `reference`, `src`, `tools`.

**Pasta de página** contém só `page.config.mjs` e `index.html`. Para remover uma página, apague a pasta (ou renomeie com `--redirect`) e rode `npm run build`.

**Mesclagem.** Config final da página = global ← `overrides` ← `bootcamp`/`form`/`support` da página. Blocos `{ }` se combinam campo a campo; listas `[ ]` são substituídas inteiras (ex.: `overrides: { faq: { items: [ … ] } }` troca o FAQ todo). `support.url: ''` na página = usa o link da config global.

**Textos.** Só **negrito**, escrito `**assim**`. HTML não é aceito (o check acusa). Valores calculados entre chaves:

| Valor | Exemplo | Vem de |
|---|---|---|
| `{dateShort}` · `{dateLong}` · `{weekday}` | 16/12/2026 · 16 de dezembro de 2026 · Quarta-feira | `exam.date` |
| `{eligibleMin}` · `{eligibleMax}` | 200 · 349 | `scores` |
| `{eligibleMinPct}` · `{eligibleMaxPct}` | 40% · 69% (arredonda para baixo sobre `scores.max`) | `scores` |
| `{approvalMin}` · `{recordedIfApproved}` · `{scoreMax}` | 350 · 350 · 500 | `scores` |
| `{stepsCount}` · `{polosCount}` · `{bootcamp}` | 3 · 7 · nome do bootcamp | listas e página |

**Erro × aviso.** *Erro* (config inválida, link fora do padrão, HTML em texto…) impede o build e, no GitHub, **para o deploy do repositório inteiro** até ser corrigido. *Aviso* (pendências como `[INSERIR…`, link vazio, arquivo gerado desatualizado) não impede; `npm run check:strict` falha com avisos e deve ser rodado antes de divulgar as URLs.

**Regras de URL** (as mesmas do HTML original, em `src/scripts/rules.mjs`): o formulário só é incorporado se o link começar com `https://docs.google.com/forms/`; o suporte só fica ativo com `https://`. O build é um pouco mais rígido: recusa o link de edição do formulário (`/edit`) e `https://` sem endereço.

**D2L.** As páginas funcionam dentro de iframe: não acessam a janela de cima e os links externos abrem em nova aba com `rel="noopener noreferrer"`.

**Tipografia.** A página toda usa **Lato**, a fonte do D2L, na mesma escala do D2L (componentes BrightspaceUI), para parecer nativa da plataforma. Tudo fica em `src/styles/05-tipografia-lato.css`; os tamanhos são variáveis no bloco `:root` do começo do arquivo.

| Papel | Onde aparece | Computador | Celular (até 615px) |
|---|---|---|---|
| Título da página | h1 do topo | 32 a 48px, cresce com a tela | 32px |
| Título de seção | h2 ("Sua prova já tem data definida"…) | 24 a 30px | 24px |
| Título de bloco | h3 das etapas, regras, dicas e formulário; nome do bootcamp; "100% presencial" | 20px | 18px |
| Texto principal | descrições das seções, texto do topo, aviso, FAQ, título do painel de polos, cidades | 19px | 16px |
| Texto de apoio | textos dentro dos cards, endereços, textos do suporte e do formulário, botões | 16px | 16px |
| Rótulos e notas | etiquetas verdes, "SUA JORNADA CONTINUA", notas pequenas, rodapé | 14px | 14px |

Os pesos 750/800/850 do original viram 700 (a Lato tem 400, 700 e 900). A data grande ("16 de dezembro de 2026", 28 a 40px), cores, espaçamentos e layout seguem o original. Dentro do iframe a página não herda a fonte do D2L, por isso a Lato vai junto, em `assets/`. Não se usa Google Fonts: assim nada é pedido a terceiros e o IP do aluno não vai para o Google. Para outra fonte: coloque o `.woff2` em `src/fonts/` e cite com `url(<nome>.woff2)` num `@font-face`; o build copia o arquivo e acrescenta `?v=`. Licença da Lato: SIL Open Font License 1.1 (permite hospedar; o aviso vai no CSS e dentro dos arquivos).

**Cache.** CSS, JS e fontes são carregados com `?v=<hash do conteúdo>`. Se mudarem, a URL muda e o navegador baixa a versão nova.

**Fidelidade.** `npm test` gera uma página com os dados do original (`tools/fixtures/`) e compara com `reference/original.html`: corpo do HTML, regras CSS na mesma ordem e o comportamento do formulário/suporte em 130 combinações de links. Mudar **textos** na config não quebra o teste. Mudar **template, CSS ou script** quebra, de propósito. Se a mudança for intencional, registre a justificativa em `tools/verify-fidelity.mjs`: no HTML, em `JUSTIFIED_DIFFERENCES`; no CSS, ponha a mudança num arquivo novo no fim de `src/styles/` (os arquivos 01 a 04 continuam iguais ao original) e registre-o em `JUSTIFIED_CSS_FILES`.

**Técnico.** Node 22 (`.nvmrc`, igual ao deploy; mínimo 20.19), só módulos nativos, finais de linha LF (`.gitattributes` da raiz). Commits: `tipo(exame-especial): descrição` (veja o README da raiz).

## Solução de problemas

**404 no GitHub Pages**
- Confira a **barra final**: `…/exame-especial/pg-1/`. Sem ela o GitHub faz um redirecionamento extra; no D2L, cole sempre a URL com a barra.
- Confira o nome com `npm run list` (o slug é o nome da pasta, com hífen e minúsculas).
- Publicação em andamento: veja **Actions**. A página nova só existe depois que o deploy fica verde.
- Página criada mas não commitada: `git status` mostra a pasta como nova (`??`).
- Cache: o GitHub Pages guarda páginas por até 10 minutos. Use **Ctrl+F5** ou uma janela anônima.

**O formulário não aparece (fica o "Espaço reservado")**
- `form.embedUrl` está vazio, ou o build não foi rodado depois de preencher.
- O link precisa ser o de **incorporação** (`…/viewform?embedded=true`). Sem `embedded=true`, o `npm run list` mostra `CONFERIR`.
- `forms.gle/…` (link curto) e `…/edit` (link de edição) são recusados pelo build, com a explicação.
- Se o formulário exige login Google ("Restringir a usuários…" ou "Limitar a 1 resposta"), ele pode não abrir dentro do iframe do D2L, porque o navegador bloqueia cookies de terceiros. Teste com uma conta de aluno; veja o BACKLOG.

**Botão "Falar com o Suporte" desabilitado (apagado, não clica)**
- Falta `support.url` (na página ou na config global) ou o link não começa com `https://`. Preencha e rode `npm run build`.

**A página aparece com outra fonte (não a Lato do D2L)**
- Confira se `assets/lato-400.woff2`, `lato-700.woff2` e `lato-900.woff2` foram commitados (`git status`). Sem eles a página usa a fonte do sistema; nada quebra.
- Depois do deploy, recarregue com Ctrl+F5.

**"✘ Build interrompido" ou "erro de digitação (linha N)"**
- Abra o arquivo indicado e olhe a linha citada e a anterior: quase sempre é vírgula faltando no fim da linha, aspas sem fechar ou chave `{ }` a mais/a menos.

**O deploy falhou no GitHub por causa do exame-especial**
- Rode `npm run check` aqui: ele mostra o mesmo erro, com arquivo, campo e como corrigir.

**"Arquivo gerado desatualizado"**
- Alguém mudou uma config ou `src/` sem rodar o build, ou editou um `index.html` à mão. Rode `npm run build` e faça o commit.

**`npm run rename` diz que o Windows não deixou renomear**
- Feche o Explorador de Arquivos, o VS Code ou o terminal que estejam dentro da pasta da página e tente de novo.

**Aparece `npm warn Unknown cli config "--redirect"`**
- Pode ignorar: o comando funciona igual. Para evitar o aviso, mantenha o `--` antes dos argumentos (`npm run rename -- pg-1 novo --redirect`).

**As datas saem em inglês ("December")**
- O Node instalado não tem dados de idioma. Instale o Node LTS oficial de nodejs.org.
