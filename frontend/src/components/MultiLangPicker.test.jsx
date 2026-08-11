import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import i18n from '../i18n';
import MultiLangPicker from './MultiLangPicker';
import { LANGUAGE_FLAGS } from './LanguageFlag';
import { LANG_CODES } from '../utils/languages';

const rect = (overrides = {}) => ({
  x: 40,
  y: 720,
  top: 720,
  right: 64,
  bottom: 744,
  left: 40,
  width: 24,
  height: 24,
  toJSON: () => {},
  ...overrides,
});

afterEach(() => vi.restoreAllMocks());

describe('MultiLangPicker', () => {
  it('keeps a representative vector flag mapped for every supported language', () => {
    expect(LANG_CODES.filter(({ code }) => !LANGUAGE_FLAGS[code])).toEqual([]);
  });

  it('portals outside clipping ancestors and flips above a bottom-edge trigger', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    const onChange = vi.fn();
    const { container } = render(
      <div style={{ overflow: 'hidden', height: 40 }}>
        <MultiLangPicker selected={[]} onChange={onChange} />
      </div>,
    );
    const trigger = screen.getByRole('button', { name: 'Add language' });
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(rect());

    fireEvent.click(trigger);

    const menu = screen.getByRole('dialog', { name: 'Add language' });
    expect(container).not.toContainElement(menu);
    expect(menu).toHaveStyle({ bottom: '84px', left: '40px', width: '220px' });
    expect(menu.style.top).toBe('');
    expect(menu.style.maxHeight).toBe('260px');

    fireEvent.click(screen.getAllByRole('button', { name: /Spanish/ })[0]);
    expect(onChange).toHaveBeenCalledWith([{ lang: 'Spanish', code: 'es' }]);
  });

  it('opens below when space permits and Escape closes then restores focus', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    render(<MultiLangPicker selected={[]} onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: 'Add language' });
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(
      rect({ y: 20, top: 20, bottom: 44 }),
    );

    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Add language' })).toHaveStyle({ top: '48px' });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Add language' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('keeps selected languages behind one compact summary control', () => {
    render(
      <MultiLangPicker
        selected={[
          { lang: 'English', code: 'en' },
          { lang: 'Spanish', code: 'es' },
          { lang: 'Japanese', code: 'ja' },
        ]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('multi-lang-selected-grid')).not.toBeInTheDocument();
    const summary = screen.getByRole('button', { name: 'Add language' });
    expect(summary).toHaveTextContent(i18n.t('dub.languages_selected', { count: 3 }));

    fireEvent.click(summary);
    const grid = screen.getByTestId('multi-lang-selected-grid');
    expect(within(grid).getByTestId('language-flag-en')).toBeInTheDocument();
    expect(within(grid).getByTestId('language-flag-es')).toBeInTheDocument();
    expect(within(grid).getByTestId('language-flag-ja')).toBeInTheDocument();
  });

  it('shows readiness and lets a prepared language be reviewed', () => {
    const onSelect = vi.fn();
    render(
      <MultiLangPicker
        selected={[
          { lang: 'Spanish', code: 'es' },
          { lang: 'Japanese', code: 'ja' },
        ]}
        onChange={vi.fn()}
        onSelect={onSelect}
        activeCode="es"
        progressByCode={{ es: { ready: 3, total: 3 }, ja: { ready: 1, total: 3 } }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add language' }));
    expect(screen.getByTestId('multi-lang-progress-es')).toHaveTextContent('3/3');
    expect(screen.getByTestId('multi-lang-progress-ja')).toHaveTextContent('1/3');
    fireEvent.click(screen.getByTestId('multi-lang-select-ja'));
    expect(onSelect).toHaveBeenCalledWith('ja');
  });

  it('renders searchable language results as responsive flag rows', () => {
    render(<MultiLangPicker selected={[]} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add language' }));

    const allLanguages = screen.getByTestId('multi-lang-all-grid');
    expect(allLanguages.className).toContain('grid-cols-[repeat(auto-fit,minmax(140px,1fr))]');
    for (const row of within(allLanguages).getAllByRole('button')) {
      expect(row.querySelector('[data-language-flag]')).not.toBeNull();
    }
  });
});
