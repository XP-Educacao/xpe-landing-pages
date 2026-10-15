# Landing pages · XP Educação

Repositório único para as páginas publicadas no GitHub Pages. **Cada pasta na raiz é uma página**, e o nome da pasta vira o final da URL:

```
https://xp-educacao.github.io/<repo>/<pasta>/
```

| Pasta | URL |
|---|---|
| `pre-mba-ia-negocios/` | `https://xp-educacao.github.io/<repo>/pre-mba-ia-negocios/` |
| `evento-tech-community/` | `https://xp-educacao.github.io/<repo>/evento-tech-community/` |

`<repo>` é o nome deste repositório. Se ele for renomeado, as URLs mudam sozinhas no próximo deploy (o endereço antigo deixa de funcionar).

## Estrutura

```
.
├── .github/workflows/deploy.yml   # build + publicação de TODAS as páginas
├── scripts/build-all.mjs          # encontra as pastas e monta o site em _site/
├── index.html                     # página da raiz (sem conteúdo, só orientação)
├── 404.html                       # página de "não encontrado" do site inteiro
├── pre-mba-ia-negocios/           # página em Vite + React (tem package.json)
└── <nova-pagina>/                 # outra página (Vite ou HTML estático)
```

O build reconhece dois tipos de página:

- **Projeto Vite** (a pasta tem `package.json`): roda `npm ci`, `npm run check` (se existir) e `npm run build`, e publica a pasta `dist/`.
- **HTML estático** (a pasta tem `index.html` e nenhum `package.json`): a pasta é publicada como está.

Pastas sem `package.json` nem `index.html` são ignoradas, assim como `scripts/`, `node_modules/` e pastas que começam com `.`.

## Regras de organização

1. **Nome da pasta = URL.** Só minúsculas, números e hífens, sem acento nem espaço (`evento-tech-community`, nunca `Evento Tech`). O build falha se o nome não seguir esse padrão.
2. **Uma pasta por página.** Nada de arquivos de uma página fora da pasta dela.
3. **Cada página é independente.** Dependências, testes e configurações ficam dentro da pasta da página.
4. **Arquivos da raiz são compartilhados.** Só mexa em `.github/`, `scripts/`, `index.html` e `404.html` quando a mudança for para todas as páginas.
5. **Nada sensível no repositório.** Tudo aqui é publicado na internet: não inclua dados pessoais de alunos ou colaboradores, senhas, tokens ou links com identificadores de clique (`gclid`, `gbraid`, `fbclid`). Em links de campanha, mantenha só os parâmetros `utm_*`.

## Rotina de trabalho (só com a `main`)

```powershell
git pull

# edite os arquivos da página

cd nome-da-pagina
npm run check          # tipos, lint, formatação e testes (páginas Vite)
cd ..

git status --short     # confira se só aparecem os arquivos que você mexeu
git add nome-da-pagina/caminho/do/arquivo
git commit -m "tipo(nome-da-pagina): descrição"
git push
```

Cada push na `main` publica o site. Se o build falhar, nada é publicado e a versão anterior continua no ar. Acompanhe em **Actions**.

Evite editar arquivos pela interface do GitHub. Se editar, rode `git pull` antes de mexer no seu computador.

## Padrão de commits

```
tipo(escopo): descrição curta no infinitivo, minúsculas, sem ponto final
```

O **escopo é o nome da pasta da página**. Para mudanças na raiz, use `repo`.

| Tipo | Quando usar | Exemplo |
|---|---|---|
| `feat` | Funcionalidade nova | `feat(evento-tech-community): adicionar formulário de inscrição` |
| `fix` | Correção | `fix(pre-mba-ia-negocios): corrigir barra de progresso do bônus` |
| `chore` | Conteúdo ou configuração (vídeo, link, material) | `chore(pre-mba-ia-negocios): atualizar vídeo da aula 5` |
| `style` | Só visual | `style(evento-tech-community): ajustar espaçamento dos cards` |
| `refactor` | Reorganização sem mudar comportamento | `refactor(pre-mba-ia-negocios): renomear componentes da jornada` |
| `docs` | Documentação | `docs(repo): explicar como criar nova página` |
| `test` | Só testes | `test(pre-mba-ia-negocios): cobrir regra dos materiais` |
| `revert` | Desfazer uma mudança ou voltar a uma versão | `revert(pre-mba-ia-negocios): voltar para a v1.0.0` |

Um commit = um assunto. Se mexeu em duas páginas, faça dois commits.

## Versionamento

O histórico de commits já registra cada mudança. Para marcar entregas importantes de uma página (lançamento, nova fase), use uma **tag com o nome da pasta**:

```powershell
git tag -a pre-mba-ia-negocios/v1.0.0 -m "Primeira versão publicada"
git push origin pre-mba-ia-negocios/v1.0.0
```

- `v1.0.0` → primeira versão no ar
- `v1.1.0` → funcionalidade nova
- `v1.0.1` → correção

Para listar as versões de uma página: `git tag -l "pre-mba-ia-negocios/*"`.

Para voltar uma página inteira a uma versão marcada, sem afetar as outras:

```powershell
git restore --source=pre-mba-ia-negocios/v1.0.0 --staged --worktree -- pre-mba-ia-negocios
git commit -m "revert(pre-mba-ia-negocios): voltar para a v1.0.0"
git push
```

## Criar uma nova página

**HTML estático** (página simples, sem build):

1. Crie a pasta `nome-da-pagina/` com um `index.html`.
2. Use caminhos **relativos** para imagens e arquivos (`img/banner.png`, nunca `/img/banner.png`).
3. Faça o commit e o push: a página fica em `https://xp-educacao.github.io/<repo>/nome-da-pagina/`.

**Projeto Vite** (página com React, componentes, testes):

1. Copie uma página Vite existente como ponto de partida, ou crie com `npm create vite@latest nome-da-pagina`.
2. No `vite.config.ts`, use `base` a partir da variável `VITE_BASE_PATH` (veja `pre-mba-ia-negocios/vite.config.ts`). O build injeta o valor certo.
3. Garanta que o `package.json` tenha os scripts `build` e, de preferência, `check`.
4. Rode `npm install` dentro da pasta e faça o commit do `package-lock.json` junto.

Para testar o site inteiro localmente, como no GitHub:

```powershell
node scripts/build-all.mjs
npx serve _site
```

## Problemas comuns

- **Página antiga depois do deploy:** recarregue com Ctrl+F5.
- **`git pull` recusado por alterações locais:** guarde com `git stash`, rode `git pull` e depois `git stash pop`.
- **`npm install` falhou com "Could not read package.json":** você está na raiz. Entre na pasta da página antes.
- **Build falhou no GitHub:** abra o run em **Actions**, procure a primeira linha com `Error` e rode o mesmo comando (`npm run check`) dentro da pasta da página.
