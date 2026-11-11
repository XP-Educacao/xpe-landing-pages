# Guia de conteúdo

Tudo o que muda semana a semana fica em **um único arquivo: `src/content/course.json`**. Não é preciso mexer em componentes.

## Como editar (sem instalar nada)

1. No GitHub, abra `src/content/course.json` e clique no lápis (**Edit this file**).
2. Faça a alteração seguindo os exemplos abaixo.
3. Clique em **Commit changes** (direto na `main`, ou abra um Pull Request se a equipe preferir revisão).
4. Acompanhe a aba **Actions**. Em ~2 minutos a página é atualizada.

Se algo estiver errado, o deploy falha com uma mensagem como a abaixo e **o site continua com a versão anterior**:

```text
[course.json] Conteúdo inválido (1 problema(s)):
  • lessons[2] (aula-3) › release.date — Data inválida. Use "AAAA-MM-DD" (...)
```

Quem roda o projeto localmente (`npm run dev`) vê a mesma lista de erros na própria página.

## Mapa: o que cada campo controla

| Nº  | Na página                        | Campo no `course.json`                                    |
| --- | -------------------------------- | --------------------------------------------------------- |
| 1   | Topo escuro (hero)               | `journey.eyebrow`, `journey.title`, `journey.description` |
| 2   | Card da aula e data de liberação | `lessons[].order`, `lessons[].title`, `lessons[].release` |
| 3   | Barra de progresso e selo        | Calculados automaticamente (não editar)                   |
| 4   | Título e subtítulo da aula       | `lessons[].title`, `lessons[].subtitle`                   |
| 5   | Vídeo                            | `lessons[].video`                                         |
| 6   | Descrição                        | `lessons[].description`                                   |

Regras de JSON que mais causam erro: textos sempre entre **aspas duplas**; **vírgula** entre itens, mas nunca depois do último; `""` (vazio) significa "em breve".

---

## a) Adicionar uma aula

Copie o bloco de uma aula existente, cole depois do último `}` da lista `lessons` (lembre da vírgula) e ajuste:

```json
{
  "id": "aula-6",
  "order": 6,
  "title": "Projeto final: IA aplicada ao seu negócio",
  "subtitle": "Estruture um caso real com o que você aprendeu.",
  "description": "Nesta aula bônus, você aplica o método da jornada a um desafio da sua empresa.",
  "release": { "type": "fixed_date", "date": "2026-11-17" },
  "video": { "provider": "youtube", "videoId": "", "thumbnail": "" }
}
```

- `id`: único, só minúsculas, números e hífens (`aula-6`). Não altere o `id` de aulas já publicadas: o progresso dos alunos é salvo por ele.
- `order`: número único; define a posição do card (a ordem no arquivo não importa).
- A barra de progresso ganha um segmento novo automaticamente.

## b) Liberação sequencial (padrão) e duração do vídeo

Por padrão, cada aula usa `"release": { "type": "sequential" }`: a Aula 1 já nasce aberta e as seguintes são liberadas pelo próprio aluno, no botão **"Liberar aula"**, quando a aula anterior atinge o gatilho definido no topo do arquivo:

```json
"progression": { "unlockNextOn": "play" },
"features": { "allowManualComplete": false },
"sound": { "enabledByDefault": true, "volume": 0.12 },
"animation": { "unlockOverlayMs": 2200 }
```

| Campo                          | O que faz                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| `progression.unlockNextOn`     | `"play"`: a próxima aula fica pronta quando o aluno dá play. `"watched"`: só após concluir a aula |
| `features.allowManualComplete` | `true` mostra "Marcar como assistida" / "Desmarcar"                                               |
| `sound`                        | Som da conquista ao liberar (o aluno pode desligar no botão "Som das conquistas")                 |
| `animation.unlockOverlayMs`    | Duração da animação "Aula liberada!" (1600 a 10000 ms)                                            |

A aula vira **"Assistido"** sozinha quando o tempo assistido chega a `duration × journey.completionThreshold` (ex.: 90%). Esse tempo é contado internamente e **não aparece na tela**. Informe a duração real de cada vídeo em `video.duration`, no formato `"mm:ss"` ou `"h:mm:ss"`:

```json
"video": { "provider": "youtube", "videoId": "XXXXXXXXXXX", "thumbnail": "", "duration": "12:30" }
```

- YouTube, Vimeo e MP4: conta só o tempo em reprodução (pausa não conta).
- Spalla (sem eventos do player): conta o tempo corrido desde o play.
- Sem `duration`: vale a posição informada pelo player (YouTube/Vimeo/MP4) ou o botão manual.

Para testar sem esperar o vídeo: `npm run dev` e abra `http://localhost:5173/?speed=60` (1 segundo real = 1 minuto). Esse atalho acelera o tempo contado durante a reprodução de um vídeo; aulas sem vídeo não iniciam a contagem automaticamente.

> O desbloqueio é experiência de uso: o progresso fica no navegador e pode ser burlado. Bloqueio real depende da API da fase 2.

## b1) Travar uma aula até publicar ("em breve")

Para deixar uma aula fechada para todos até o conteúdo ficar pronto, use:

```json
"release": { "type": "locked" }
```

- O card mostra **"Disponível em breve"** e o botão "Liberar aula" não aparece, mesmo que o aluno já tenha dado play na aula anterior.
- As aulas seguintes também ficam bloqueadas, porque dependem desta. Para publicar aos poucos, trave todas as que ainda não estão prontas.
- **Para liberar**, troque `"locked"` por `"sequential"` (o aluno libera pelo botão, como de costume) ou por uma data (`fixed_date`, abaixo), faça o commit e o push. Exemplo de commit: `feat(pre-mba-ia-negocios): liberar aula 2`.
- Quem já tinha liberado ou assistido a aula antes da trava volta a vê-la bloqueada; o progresso fica salvo e reaparece quando a aula for liberada.
- Se todas as aulas estiverem travadas, a página mostra "As aulas serão publicadas em breve".

## b2) Liberação por data (opcional)

Para voltar a liberar uma aula por data, troque o `release` dela. A aula é liberada **à 00:00 do dia, no fuso `journey.timezone` (America/Sao_Paulo)**, independentemente do fuso do aluno.

```json
"release": { "type": "fixed_date", "date": "2026-10-27" }
```

Formatos aceitos:

| Formato                       | Significado                                    |
| ----------------------------- | ---------------------------------------------- |
| `"2026-10-27"`                | 27/10/2026 à meia-noite (fuso da jornada)      |
| `"2026-10-27T00:00:00-03:00"` | Instante exato (o fuso `-03:00` é obrigatório) |
| `"2026-10-27T14:30:00-03:00"` | 27/10/2026 às 14h30 (horário de Brasília)      |

Para conferir antes de publicar: `npm run dev` e abra `http://localhost:5173/?today=2026-10-27`.

**Liberação pela data de inscrição (fase 2):** quando a API estiver ativa, use:

```json
"release": { "type": "enrollment_offset", "days": 10 }
```

A aula abre 10 dias após a inscrição do aluno (à 00:00). Enquanto a fase 2 não estiver ativa, essas aulas aparecem bloqueadas com "Liberação conforme a data da sua inscrição".

## c) Trocar o vídeo

**YouTube** (cole o ID ou o link completo; os dois funcionam):

```json
"video": { "provider": "youtube", "videoId": "https://www.youtube.com/watch?v=XXXXXXXXXXX", "thumbnail": "" }
```

**Vimeo** (inclusive vídeos não listados, com o hash no link):

```json
"video": { "provider": "vimeo", "videoId": "https://vimeo.com/123456789/abcdef1234", "thumbnail": "" }
```

**Arquivo MP4** (CDN ou pasta `public/`), com legenda opcional em WebVTT:

```json
"video": { "provider": "mp4", "url": "videos/aula-1.mp4", "thumbnail": "thumbnails/aula-1.jpg", "captionsUrl": "videos/aula-1.vtt" }
```

- **Spalla** (use a URL do player, não um endereço de arquivo MP4):

```json
"video": {
  "provider": "spalla",
  "embedUrl": "https://beyond.spalla.io/player/?video=ID_DO_VIDEO;&subtitleLanguage=null"
}
```

- `videoId`/`url` vazio mostra **Vídeo em breve**.
- `thumbnail` é opcional nos provedores que a aceitam; o YouTube usa a capa do vídeo automaticamente. Spalla usa a própria capa do player e não aceita `thumbnail`.
- YouTube, Vimeo e MP4 informam o progresso do vídeo. Em players Spalla, use **Marcar como assistido** para registrar a conclusão.

---

## Outros ajustes

- **Topo e cabeçalho:** `journey.eyebrow`, `journey.title`, `journey.description` e `journey.header` (`brandName`, `label` e `logoUrl`; para usar o logo oficial, coloque o arquivo em `public/marca/logo.svg` e use `"logoUrl": "marca/logo.svg"`). Remova `header` para ocultar a barra superior.
- **Textos fixos da interface** ("Marcar como assistida", "Em breve", avisos...) ficam em `src/content/ui-text.ts`.

## Erros comuns

| Mensagem                         | Como resolver                                                         |
| -------------------------------- | --------------------------------------------------------------------- |
| `O arquivo não é um JSON válido` | Falta/sobra vírgula ou aspas. Cole o arquivo em um validador de JSON. |
| `Campo obrigatório ausente.`     | O campo indicado foi apagado. Copie de outra aula.                    |
| `Campo desconhecido: "subtitel"` | Erro de digitação no nome do campo.                                   |
| `Data inválida...`               | Use `"AAAA-MM-DD"` (ex.: `"2026-10-27"`).                             |
| `Link inválido...`               | O link precisa começar com `https://`.                                |
| `O id "aula-2" está repetido...` | Cada aula precisa de um `id` único.                                   |
