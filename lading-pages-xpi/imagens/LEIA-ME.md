# Imagens do hub

Coloque aqui os logos e depois escreva **só o nome do arquivo** em `times.config.mjs`, exatamente igual, inclusive maiúsculas. Só os arquivos citados na config são publicados.

| Onde aparece | Campo na config | Versão do logo | Tamanho do espaço |
|---|---|---|---|
| Barra branca do topo | `marca.logo` | para **fundo claro** (preta) | 28 px de altura, até 220 px de largura |
| Card de cada time (fundo branco) | `logo` dentro do time | para **fundo claro** | 80 px de altura, até 240 px de largura |

Dicas:

- **.png** e **.svg** funcionam (também .webp e .jpg). Até 300 KB por arquivo.
- Use **fundo transparente** e sem margem sobrando em volta do desenho.
- Para PNG ficar nítido, exporte com o dobro da altura do espaço: cerca de 56 px de altura para o topo e 160 px para os cards.
- Nome do arquivo sem espaço nem acento: `logo-gente-e-cultura.png`, não `Logo Gente & Cultura.png`. No Windows `Logo.PNG` e `logo.png` parecem iguais, mas no GitHub não são, e aí a publicação para com erro.
- Tudo aqui é publicado na internet: use só logos oficiais, nunca fotos de pessoas ou documentos internos.

Exemplo:

```js
marca: { nome: 'XP Inc.', logo: 'logo-xp-inc.png' },
…
{ nome: 'Academy', home: 12345, logo: 'logo-academy.png' },
```
