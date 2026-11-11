# Pré-MBA em IA para Negócios · XP Educação

Página única (one-page) da jornada **Pré-MBA em IA para Negócios**, com 5 aulas liberadas semanalmente. É aberta dentro do Brightspace (D2L) por link ou iframe e hospedada no **GitHub Pages** (100% estático).

> **Atualizações semanais/mensais (datas, títulos, vídeos, links e Padlet) são feitas editando um único arquivo: [`src/content/course.json`](src/content/course.json).** Veja o [Guia de conteúdo](docs/CONTENT_GUIDE.md).

## Stack

Vite · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui (Button, Badge, Skeleton) · lucide-react · Zod · Vitest.

## Como rodar

Requisitos: Node.js 22 (veja `.nvmrc`) e npm.

```bash
npm ci
npm run dev
```

Abra `http://localhost:5173`. Para simular outra data, use `?today=` (ativo em desenvolvimento):

- `http://localhost:5173/?today=2026-10-27` → aulas 1, 2 e 3 liberadas; 4 e 5 bloqueadas;
- `http://localhost:5173/?today=2026-10-19T23:59:50-03:00` → em 10 segundos, a aula 2 é liberada na sua frente, sem recarregar.

| Script            | O que faz                                                      |
| ----------------- | -------------------------------------------------------------- |
| `npm run dev`     | Servidor local com recarga automática                          |
| `npm run build`   | Checa tipos, **valida o `course.json`** e gera `dist/`         |
| `npm run preview` | Serve o `dist/` localmente                                     |
| `npm test`        | Testes (Vitest)                                                |
| `npm run lint`    | ESLint (inclui as regras de arquitetura)                       |
| `npm run format`  | Formata o código com Prettier                                  |
| `npm run check`   | Tipos + lint + formatação + testes (rode antes de abrir um PR) |

## Deploy (GitHub Pages)

1. No repositório: **Settings › Pages › Build and deployment › Source: GitHub Actions**.
2. Faça push na `main`. O workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) roda checagens, testes e build e publica em `https://<usuario>.github.io/<repo>/`.
3. O caminho base (`/<repo>/`) é configurado automaticamente. Para builds manuais, use `VITE_BASE_PATH=/<repo>/ npm run build`.

Se o `course.json` estiver inválido, **o build falha e o site continua com a versão anterior** (nada quebrado chega aos alunos). A mensagem de erro aponta a aula e o campo.

### Incorporar no Brightspace (D2L)

Use um tópico do tipo link (abrir em nova janela) ou um arquivo HTML com iframe:

```html
<iframe
  src="https://<usuario>.github.io/<repo>/"
  title="Pré-MBA em IA para Negócios"
  style="width: 100%; height: 1400px; border: 0"
  allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
  allowfullscreen
></iframe>
```

O atributo `allow` é necessário para o vídeo tocar após o clique e abrir em tela cheia dentro do iframe.

## Variáveis de ambiente

Todas são opcionais (veja [`.env.example`](.env.example)).

| Variável                   | Padrão                         | Uso                                                |
| -------------------------- | ------------------------------ | -------------------------------------------------- |
| `VITE_BASE_PATH`           | `/`                            | Caminho de publicação (`/<repo>/` no GitHub Pages) |
| `VITE_ACCESS_PROVIDER`     | `static`                       | `static` (fase 1) ou `api` (fase 2, FastAPI)       |
| `VITE_ACCESS_API_BASE_URL` | vazio                          | URL da API de acesso (somente com `api`)           |
| `VITE_ALLOW_DATE_OVERRIDE` | `true` em dev, `false` em prod | Habilita o simulador `?today=`                     |

## Onde mexer

| Quero mudar…                                        | Arquivo                                                       |
| --------------------------------------------------- | ------------------------------------------------------------- |
| Datas, títulos, vídeos e Padlet                     | `src/content/course.json`                                     |
| Textos fixos da interface (botões, rótulos, avisos) | `src/content/ui-text.ts`                                      |
| Perguntas e respostas do FAQ ("Dúvidas frequentes") | `src/content/faq.ts` ([veja abaixo](#faq-dúvidas-frequentes)) |
| Cores, sombras (design tokens)                      | `src/styles/tokens.css`                                       |
| Regras de liberação e progresso                     | `src/domain/` (funções puras, com testes)                     |
| Integração com a API (fase 2)                       | `src/services/access/ApiAccessProvider.ts`                    |

## FAQ (Dúvidas frequentes)

O FAQ fica sempre no fim da página. Perguntas e respostas são editadas em [`src/content/faq.ts`](src/content/faq.ts), e o contador abaixo do título ("N dúvidas frequentes.") se ajusta sozinho.

Cada pergunta tem `question` (a pergunta) e `answer` (a resposta):

```ts
{
  question: 'Carga horária?',
  answer: 'Os 4 webinars totalizam 4 horas de conteúdo.',
},
```

### Resposta com blocos

Para respostas mais ricas, `answer` vira uma lista de blocos entre colchetes. Os blocos podem ser misturados dentro de `answer: [ ... ]`, na ordem que você quiser:

| Bloco            | Como escrever                             | Aparece como                           |
| ---------------- | ----------------------------------------- | -------------------------------------- |
| Parágrafo        | `'Texto.'`                                | texto normal                           |
| Lista de tópicos | `{ topics: [ ... ] }`                     | tópicos em blocos com marcador verde   |
| Destaque         | `{ label: 'Importante', note: 'Texto.' }` | caixa colorida com ícone de informação |
| Complementar     | `{ small: 'Texto.' }`                     | texto pequeno e discreto               |

Exemplo:

```ts
{
  question: 'O que o curso oferece (atributos)?',
  answer: [
    'Acesso aos 4 webinars:',
    {
      topics: [
        { title: 'Playbook XP', description: 'Descrição curta.', complement: 'Detalhe extra.' },
        { title: 'O Advisor do Futuro' },
      ],
    },
    { label: 'Importante', note: 'Esses webinars foram gravados por especialistas.' },
    { small: 'Texto complementar, menor e discreto.' },
  ],
},
```

### Tópicos

Cada tópico pode ser só um texto (`'Tópico'`) ou ter até três partes:

| Campo         | Obrigatório | Aparece como                            |
| ------------- | ----------- | --------------------------------------- |
| `title`       | sim         | título em negrito                       |
| `description` | não         | descrição em cinza, logo abaixo         |
| `complement`  | não         | informação extra, menor e mais discreta |

### Opções da lista de tópicos

Todas são opcionais e ficam dentro do bloco, ao lado de `topics`:

| Opção       | Valores                                  | Padrão    | Para que serve                                                                                                                                                      |
| ----------- | ---------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `layout`    | `'cards'`, `'list'`, `'timeline'`        | `'cards'` | `cards`: um bloco por tópico, em grade · `list`: painel único, uma linha por tópico · `timeline`: etapas ligadas por uma linha (use só quando **existe uma ordem**) |
| `marker`    | `'check'`, `'play'`, `'dot'`, `'number'` | `'check'` | ícone à esquerda de cada tópico; `number` mostra 01, 02, 03… (padrão na `timeline`)                                                                                 |
| `itemLabel` | qualquer texto, ex.: `'Webinar'`         | —         | rótulo pequeno acima de cada título; só ganha número ("WEBINAR 1") com `marker: 'number'`                                                                           |
| `title`     | qualquer texto                           | —         | pequeno título acima da lista                                                                                                                                       |
| `columns`   | `1` ou `2`                               | `2`       | colunas no desktop (só no `cards`); no celular é sempre 1                                                                                                           |

Exemplo (é o da pergunta "Quais são os módulos do curso?"):

```ts
{
  layout: 'list',
  marker: 'play',
  topics: [{ title: 'Playbook XP' }, { title: 'O Advisor do Futuro' }],
},
```

### Opções do destaque

| Opção   | Valores                            | Padrão    | Para que serve                                                       |
| ------- | ---------------------------------- | --------- | -------------------------------------------------------------------- |
| `label` | qualquer texto                     | —         | palavra em negrito antes do texto: "Importante", "Atenção", "Dica"…  |
| `tone`  | `'brand'`, `'neutral'`, `'reward'` | `'brand'` | cor da caixa: verde, cinza ou roxo (o roxo do card do próximo passo) |

### Dicas para editar sem erro

- Campos vazios (`''`) não aparecem na página. Dá para deixar `description: ''` em branco enquanto o texto não está pronto.
- Textos sempre entre **aspas simples** (`'...'`) e com **vírgula** entre os itens.
- Se o texto tiver apóstrofo ('), escreva `\'` no lugar.
- Se a página quebrar depois de uma edição, `npm run dev` mostra no terminal a linha com o problema (geralmente aspas ou vírgula faltando).

## Aviso importante: liberação por data é só experiência de uso

Nesta fase, o bloqueio das aulas é **visual (UX)**. Todo o conteúdo do `course.json` (incluindo links de vídeos de aulas futuras) é público: fica no repositório e no JavaScript publicado. **Não coloque links que não possam ser vistos antes da data.** Bloqueio real só virá com o backend ([roadmap da API](docs/API_ROADMAP.md)).

Privacidade (LGPD): a página não coleta dados pessoais. O progresso fica apenas no navegador do aluno (`localStorage`, chave `xp-premba:v1:progress`) e os vídeos do YouTube usam o domínio `youtube-nocookie.com`.

## Documentação

- [Guia de conteúdo](docs/CONTENT_GUIDE.md): adicionar aula, trocar datas, links, vídeos e Padlet
- [Arquitetura](docs/ARCHITECTURE.md): camadas, fluxo de dados e decisões
- [Roadmap da API (fase 2)](docs/API_ROADMAP.md): contrato e checklist de migração
- [Como contribuir](CONTRIBUTING.md): convenções, commits, componentes e testes
