# Hub de times · XP Inc. no D2L

Página única que direciona cada pessoa para a **home do seu time** no D2L Brightspace. Cada time é um card; o card leva para a home daquele time.

```
https://xp-educacao.github.io/xpe-landing-pages/lading-pages-xpi/
```

> **Regra principal:** o hub mostra **só times**. Ele não lista, não conta e não cita cursos. Cada time cuida dos próprios cursos na home dele, e a página só cresce quando entra um time novo. O `npm run check` recusa campos como `cursos` ou `trilhas` e textos como “120 cursos”.

## O dia a dia: só um arquivo

Tudo o que muda com frequência está em **`times.config.mjs`**: os times, os textos da página e o endereço do D2L. Você não precisa mexer em HTML, CSS ou JavaScript.

### Adicionar um time

1. Abra a home do time no D2L e copie o número que aparece no fim do endereço:
   `https://suaempresa.brightspace.com/d2l/home/`**`12345`**
2. Em `times.config.mjs`, copie um bloco da lista `times` e troque os dados:

   ```js
   {
     nome: 'Academy',
     home: 12345,
     descricao: 'Uma frase opcional sobre o time.',
     logo: 'logo-academy.svg',
   },
   ```

3. Confira e publique (veja abaixo).

| Campo | Obrigatório | O que é |
|---|---|---|
| `nome` | sim | Nome do time, como as pessoas o reconhecem (até 60 caracteres). |
| `home` | não | Número da home no D2L (`12345`) **ou** o endereço completo (`'https://…'`). Vazio (`''`) mostra o card como “Em breve”, sem link. |
| `descricao` | não | Uma frase sobre o time (até 120 caracteres). **Não cite cursos.** |
| `logo` | não | Nome do arquivo do logo na pasta `imagens/`, exatamente igual (versão para **fundo claro**, porque o card é branco). Vazio mostra a sigla. |
| `sigla` | não | Até 3 letras, exibidas quando não há logo. Sem ela, sai das iniciais do nome. |
| `palavrasChave` | não | Outros nomes que as pessoas digitam na busca (não aparecem na tela). |

Os cards ficam em **ordem alfabética** automaticamente, então o time novo pode entrar em qualquer lugar da lista. Para mudar isso, use `ordem: 'manual'`.

### Remover ou renomear um time

Apague o bloco do time ou troque o `nome`. Para tirar o link sem tirar o card, deixe `home: ''`.

### Primeira configuração (uma vez só)

Em `times.config.mjs`, bloco `d2l`:

- **`endereco`**: o começo do endereço do D2L, sem barra no final (ex.: `'https://suaempresa.brightspace.com'`). Enquanto estiver vazio, todos os times aparecem como “Em breve”.
- **`abrirEm`**: onde a home abre quando a pessoa clica:
  - `'_top'` (padrão): na janela inteira, no lugar do D2L. É o certo quando o hub está num iframe do D2L.
  - `'_blank'`: numa nova aba.
  - `'_self'`: dentro do próprio quadro. Evite no iframe, porque aparece um D2L dentro do D2L.

> Os 3 times (Academy, Atendimento e Gente e Cultura) já estão na config, ainda sem `home`: aparecem como “Em breve” até você preencher o número da home de cada um e o `d2l.endereco`.

## Conferir e ver antes de publicar

Dentro da pasta `lading-pages-xpi`:

```powershell
cd lading-pages-xpi
npm run check
```

O `check` diz **onde** está cada problema, **o que** houve e **como corrigir**:

- **ERRO** (ex.: vírgula faltando, endereço inválido, campo de cursos): o deploy não acontece e a versão anterior continua no ar.
- **AVISO** (ex.: time ainda sem home): o hub publica, mas vale resolver.

Antes de divulgar o link, rode o modo estrito, que falha também com avisos:

```powershell
npm run check:strict
```

Para ver no navegador:

```powershell
npm run preview
```

Abra o endereço que aparecer no terminal. Também dá para ver o hub **dentro de um iframe, como no D2L**, em `http://localhost:4180/__d2l/`, inclusive em outros tamanhos (`?largura=800&altura=640`). A página é gerada de novo a cada **F5**: edite a config e atualize o navegador. Pare com **Ctrl+C**.

Para ver o visual com links ativos e logos de exemplo antes de ter os dados reais:

```powershell
npm run preview -- --config tools/fixtures/demo.config.mjs
```

## Publicar

Igual às outras páginas do repositório (veja o `README.md` da raiz):

```powershell
git add lading-pages-xpi/times.config.mjs
git commit -m "chore(lading-pages-xpi): adicionar time de tecnologia"
git push
```

O GitHub roda `npm ci`, `npm run check` e `npm run build` e publica a pasta `dist/` em alguns minutos. Se algo der errado, recarregue com **Ctrl+F5**.

## Colocar no D2L

**Como link:** use o endereço do topo deste arquivo.

**Embutido numa página do D2L** (HTML do widget ou do tópico):

```html
<iframe
  src="https://xp-educacao.github.io/xpe-landing-pages/lading-pages-xpi/"
  title="Times da XP Inc. no D2L"
  style="display:block;width:100%;height:85vh;min-height:640px;border:0"
></iframe>
```

O hub ocupa toda a largura do quadro e pelo menos a altura dele. O topo e a grade de cards se ajustam a qualquer tamanho, de celular a tela cheia. Se o clique no card **não fizer nada** dentro do D2L, o quadro está bloqueando a navegação da janela: troque `abrirEm` para `'_blank'`.

## Logos

Coloque os arquivos na pasta **`imagens/`** e escreva só o nome deles na config. Tamanhos e formatos estão em `imagens/LEIA-ME.md`.

| Onde aparece | Campo | Versão do logo |
|---|---|---|
| Faixa preta do topo (opcional) | `marca.logo` | **branca** (fundo escuro) |
| Card de cada time | `logo` do time | para **fundo claro** (o card é branco) |

Sem `marca.logo`, o topo fica só com o texto (hoje está assim, porque o logo da XP Inc. disponível é o preto). Sem `logo` no time, o card mostra a sigla. O `check` avisa se o arquivo não existir ou tiver mais de 300 KB.

## Identidade visual

As cores seguem o site oficial da XP Inc. (xpinc.com): preto e branco, cinzas neutros e o verde-água do logo, com o degradê `#02C8BB → #146260` no paralelogramo do topo. A fonte é a Interstate, a da XP Inc.: quem a tiver instalada vê o hub nela, e os demais veem Roboto/Segoe UI, porque o hub não baixa fontes de fora. Os cantos são retos, como no site. Os cards são brancos sobre uma faixa cinza-clara porque os logos dos times são a versão para fundo claro (preto + verde-água). Se um dia vierem versões brancas dos logos, dá para voltar a usar cards pretos mudando os tokens.

Para ajustar, mexa só no topo de `src/estilos.css`, na seção “TOKENS” (`--cor-marca`, `--cor-tinta`, `--altura-logo`…). Todo o hub muda junto.

## Como funciona

```
lading-pages-xpi/
├── times.config.mjs         ← o único arquivo do dia a dia
├── imagens/                 ← logos da XP Inc. e dos times (veja LEIA-ME.md)
├── src/
│   ├── estilos.css          ← design tokens + componentes (vai embutido no HTML)
│   └── hub.js               ← busca de times (só carrega com 8+ times; ajuste em busca.aPartirDe)
├── tools/
│   ├── build.mjs            ← npm run build: gera dist/
│   ├── check.mjs            ← npm run check: valida config e página gerada
│   ├── preview.mjs          ← npm run preview: servidor local + simulação do D2L
│   ├── hub.test.mjs         ← testes das regras (rodam dentro do check)
│   ├── fixtures/            ← config de demonstração + logos de exemplo
│   └── lib/                 ← leitura da config, validação, template HTML
└── dist/                    ← gerada pelo build (não vai para o git)
```

- **Zero dependências:** só Node (veja `.nvmrc`). Nada para atualizar e nenhum `npm audit fix`.
- **Segura no iframe:** a página não carrega nada de fora (sem CDN, fontes externas ou rastreadores). Todo texto da config é escapado e uma Content-Security-Policy bloqueia scripts e estilos que não sejam os do próprio hub. O script não acessa a página do D2L.
- **Funciona sem JavaScript:** a lista é HTML pronto. O script só acrescenta a busca.
- **Busca:** compara o começo das palavras do nome, da sigla, da descrição e das palavras-chave, sem diferenciar acentos. Atalhos: `/` foca a busca, `Esc` limpa e `Enter` abre o time quando sobra um só.
- **Acessível:** navegação por teclado com foco visível, link para pular para a lista, anúncio do número de resultados para leitor de tela, contraste AA e respeito a “reduzir movimento”.
- **Não indexada:** `noindex` (é uma página de uso interno).

## Problemas comuns

- **`npm run check` aponta uma linha:** quase sempre falta vírgula no fim do bloco anterior, ou uma aspa não foi fechada.
- **“Este campo não existe”:** erro de digitação no nome do campo (ex.: `descriçao` em vez de `descricao`).
- **Todos os cards aparecem “Em breve”:** o `d2l.endereco` está vazio.
- **Porta em uso no preview:** feche o outro preview ou use outra porta: `$env:PORT=4181; npm run preview`.
