import { Check, Info, Play } from 'lucide-react';

import type {
  FaqAnswer as Answer,
  FaqAnswerBlock,
  FaqNote,
  FaqTopic,
  FaqTopicList,
} from '@/content/faq.ts';
import { cn } from '@/lib/cn.ts';

const PARAGRAPH_CLASS = 'text-[15px] leading-relaxed text-neutral-600 md:text-base';

const NOTE_TONE: Record<
  NonNullable<FaqNote['tone']>,
  { box: string; icon: string; label: string }
> = {
  brand: {
    box: 'bg-brand-50 ring-brand-100',
    icon: 'text-brand-700',
    label: 'text-brand-800',
  },
  neutral: {
    box: 'bg-neutral-50 ring-neutral-200',
    icon: 'text-neutral-600',
    label: 'text-ink-950',
  },
  reward: {
    box: 'bg-reward-50 ring-reward-100',
    icon: 'text-reward-600',
    label: 'text-reward-700',
  },
};

type Marker = NonNullable<FaqTopicList['marker']>;

/** Normalizes a topic; empty strings count as "not filled". */
function readTopic(topic: FaqTopic) {
  if (typeof topic === 'string')
    return { title: null, description: topic || null, complement: null };
  return {
    title: topic.title || null,
    description: topic.description || null,
    complement: topic.complement || null,
  };
}

/** Check, play, dot or "01", inside the soft green chip. */
function MarkerGlyph({ marker, index }: { readonly marker: Marker; readonly index: number }) {
  if (marker === 'number') {
    return <span className="font-bold tabular-nums">{String(index + 1).padStart(2, '0')}</span>;
  }
  if (marker === 'dot') return <span className="size-1.5 rounded-full bg-brand-600" />;
  if (marker === 'play') {
    // Nudged right: a triangle looks off-center when centered by its box.
    return <Play className="size-3 translate-x-px" fill="currentColor" strokeWidth={2} />;
  }
  return <Check className="size-3.5" strokeWidth={2.75} />;
}

interface TopicProps {
  readonly topic: FaqTopic;
  readonly marker: Marker;
  readonly index: number;
  /** Small label above the title ("MÓDULO 1" when ordered, "MÓDULO" otherwise). */
  readonly label: string | null;
}

/** Label, title, description and complement — shared by every layout. */
function TopicText({ topic, label }: Pick<TopicProps, 'topic' | 'label'>) {
  const { title, description, complement } = readTopic(topic);
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      {label && (
        <span className="text-[11px] font-semibold tracking-[0.08em] text-brand-700 uppercase">
          {label}
        </span>
      )}
      {title && (
        <span className="text-sm leading-snug font-semibold text-ink-950 md:text-[15px]">
          {title}
        </span>
      )}
      {description && (
        <span
          className={cn(
            'text-sm leading-relaxed',
            title ? 'text-neutral-600' : 'font-medium text-ink-800',
          )}
        >
          {description}
        </span>
      )}
      {complement && (
        <span className="mt-1 text-xs leading-relaxed text-neutral-500">{complement}</span>
      )}
    </span>
  );
}

/** "cards": one soft box per topic, in a grid. Same chip language as "Como funciona". */
function CardTopic({ marker, ...props }: TopicProps) {
  return (
    <li className="flex items-start gap-3 rounded-xl bg-neutral-50 px-3.5 py-3 ring-1 ring-neutral-200/70">
      <span
        aria-hidden="true"
        className="mt-px grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-[11px] text-brand-700 ring-1 ring-brand-100"
      >
        <MarkerGlyph marker={marker} index={props.index} />
      </span>
      <TopicText {...props} />
    </li>
  );
}

/** "list": rows inside one panel, split by thin lines — no sense of order. */
function ListTopic({ marker, ...props }: TopicProps) {
  return (
    <li className="flex items-center gap-3.5 px-4 py-3.5">
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-xs text-brand-700 ring-1 ring-brand-100"
      >
        <MarkerGlyph marker={marker} index={props.index} />
      </span>
      <TopicText {...props} />
    </li>
  );
}

/** "timeline": steps joined by a thin line, like a trail (use when there IS an order). */
function TimelineTopic({ marker, ...props }: TopicProps) {
  return (
    <li className="group/step relative flex gap-4 pb-5 last:pb-0">
      {/* Connector to the next step (hidden on the last one). */}
      <span
        aria-hidden="true"
        className="absolute top-9 bottom-1 left-[17px] w-px bg-brand-200 group-last/step:hidden"
      />
      <span
        aria-hidden="true"
        className="relative grid size-9 shrink-0 place-items-center rounded-full bg-white text-xs text-brand-700 shadow-soft ring-1 ring-brand-200"
      >
        <MarkerGlyph marker={marker} index={props.index} />
      </span>
      <span className="pt-0.5">
        <TopicText {...props} />
      </span>
    </li>
  );
}

const LAYOUT = {
  cards: { Item: CardTopic, listClass: 'grid gap-2' },
  list: {
    Item: ListTopic,
    listClass:
      'divide-y divide-neutral-200/80 overflow-hidden rounded-xl bg-neutral-50 ring-1 ring-neutral-200/70',
  },
  timeline: {
    Item: TimelineTopic,
    listClass: 'rounded-xl bg-neutral-50 p-4 ring-1 ring-neutral-200/70 sm:p-5',
  },
} as const;

function TopicList({ list }: { readonly list: FaqTopicList }) {
  const layout = list.layout ?? 'cards';
  const marker = list.marker ?? (layout === 'timeline' ? 'number' : 'check');
  const isOrdered = marker === 'number';
  const ListTag = isOrdered ? 'ol' : 'ul';
  const { Item, listClass } = LAYOUT[layout];
  return (
    <div className="flex flex-col gap-2">
      {list.title && (
        <p className="text-xs font-semibold tracking-[0.08em] text-neutral-500 uppercase">
          {list.title}
        </p>
      )}
      <ListTag
        className={cn(listClass, layout === 'cards' && list.columns !== 1 && 'sm:grid-cols-2')}
      >
        {list.topics.map((topic, index) => (
          <Item
            key={typeof topic === 'string' ? topic : topic.title}
            topic={topic}
            marker={marker}
            index={index}
            label={
              list.itemLabel
                ? isOrdered
                  ? `${list.itemLabel} ${index + 1}`
                  : list.itemLabel
                : null
            }
          />
        ))}
      </ListTag>
    </div>
  );
}

function Note({ note }: { readonly note: FaqNote }) {
  const tone = NOTE_TONE[note.tone ?? 'brand'];
  return (
    <div className={cn('flex items-start gap-3 rounded-xl px-4 py-3 ring-1', tone.box)}>
      <Info aria-hidden="true" className={cn('mt-0.5 size-4 shrink-0', tone.icon)} />
      <p className="text-sm leading-relaxed text-ink-800">
        {note.label && <strong className={cn('font-semibold', tone.label)}>{note.label}: </strong>}
        {note.note}
      </p>
    </div>
  );
}

function Block({ block }: { readonly block: FaqAnswerBlock }) {
  if (typeof block === 'string') return block ? <p className={PARAGRAPH_CLASS}>{block}</p> : null;
  if ('topics' in block) return <TopicList list={block} />;
  if ('note' in block) return block.note ? <Note note={block} /> : null;
  return block.small ? (
    <p className="text-xs leading-relaxed text-neutral-500">{block.small}</p>
  ) : null;
}

/** FAQ answer: plain text, or paragraphs, topic lists, highlight boxes and notes in order. */
export function FaqAnswer({ answer }: { readonly answer: Answer }) {
  if (typeof answer === 'string') return <p className={PARAGRAPH_CLASS}>{answer}</p>;
  return (
    <div className="flex flex-col gap-3">
      {answer.map((block, index) => (
        // Blocks are static content in a fixed order: the index is a stable key.
        <Block key={index} block={block} />
      ))}
    </div>
  );
}
