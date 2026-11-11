// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { FaqAnswer } from './FaqAnswer.tsx';

afterEach(cleanup);

describe('<FaqAnswer />', () => {
  it('plain text answer renders as a paragraph', () => {
    render(<FaqAnswer answer="Resposta simples." />);
    expect(screen.getByText('Resposta simples.').tagName).toBe('P');
  });

  it('renders paragraphs, topics (title, description, complement), notes and small print', () => {
    render(
      <FaqAnswer
        answer={[
          'Introdução.',
          {
            title: 'Webinars',
            marker: 'number',
            topics: [
              { title: 'Playbook XP', description: 'Descrição.', complement: 'Complemento.' },
              'Tópico só com texto',
            ],
          },
          { label: 'Importante', note: 'Texto em destaque.' },
          { small: 'Texto complementar.' },
        ]}
      />,
    );

    expect(screen.getByText('Introdução.')).toBeTruthy();
    expect(screen.getByText('Webinars')).toBeTruthy();
    expect(screen.getByRole('list').tagName).toBe('OL');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Playbook XP')).toBeTruthy();
    expect(screen.getByText('Descrição.')).toBeTruthy();
    expect(screen.getByText('Complemento.')).toBeTruthy();
    expect(screen.getByText('Tópico só com texto')).toBeTruthy();
    expect(screen.getByText('Importante:')).toBeTruthy();
    expect(screen.getByText('Texto em destaque.')).toBeTruthy();
    expect(screen.getByText('Texto complementar.')).toBeTruthy();
  });

  it('timeline layout: numbered steps with the item label ("Módulo 1", "Módulo 2")', () => {
    render(
      <FaqAnswer
        answer={[
          {
            layout: 'timeline',
            itemLabel: 'Módulo',
            topics: [{ title: 'Playbook XP' }, { title: 'O Advisor do Futuro' }],
          },
        ]}
      />,
    );
    expect(screen.getByRole('list').tagName).toBe('OL');
    const [first, second] = screen.getAllByRole('listitem');
    expect(first?.textContent).toContain('Módulo 1');
    expect(first?.textContent).toContain('Playbook XP');
    expect(second?.textContent).toContain('Módulo 2');
  });

  it('list layout with play marker: unordered rows, label without a number', () => {
    render(
      <FaqAnswer
        answer={[
          {
            layout: 'list',
            marker: 'play',
            itemLabel: 'Webinar',
            topics: [{ title: 'Playbook XP' }, { title: 'O Advisor do Futuro' }],
          },
        ]}
      />,
    );
    expect(screen.getByRole('list').tagName).toBe('UL');
    const [first] = screen.getAllByRole('listitem');
    expect(first?.textContent).toBe('WebinarPlaybook XP');
  });

  it('skips empty fields, so drafts with blank texts stay clean', () => {
    const { container } = render(
      <FaqAnswer
        answer={[
          '',
          { topics: [{ title: 'Só o título', description: '', complement: '' }] },
          { note: '' },
          { small: '' },
        ]}
      />,
    );
    const item = screen.getByRole('listitem');
    expect(item.textContent).toBe('Só o título');
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });
});
