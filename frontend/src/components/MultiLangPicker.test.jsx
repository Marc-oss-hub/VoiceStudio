import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';

import MultiLangPicker from './MultiLangPicker';
import { LANGUAGE_FLAGS } from './LanguageFlag';
import { LANG_CODES } from '../utils/languages';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MultiLangPicker dropdown positioning', () => {
  it('keeps a representative vector flag mapped for every supported language', () => {
    expect(LANG_CODES.filter(({ code }) => !LANGUAGE_FLAGS[code])).toEqual([]);
  });

  it('portals and flips the dropdown above a trigger near the footer', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 700,
      right: 360,
      bottom: 728,
      left: 120,
      width: 240,
      height: 28,
      x: 120,
      y: 700,
      toJSON: () => {},
    });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });

    const view = render(<MultiLangPicker selected={[]} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button'));

    const dropdown = screen.getByTestId('multi-lang-dropdown');
    expect(view.container.contains(dropdown)).toBe(false);
    expect(dropdown).toHaveClass('multi-lang__drop--portal');
    expect(dropdown.style.bottom).not.toBe('');
    expect(dropdown.style.top).toBe('');
  });

  it('lays selected languages out in a responsive flag grid', () => {
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

    const grid = screen.getByTestId('multi-lang-selected-grid');
    expect(grid.className).toContain('grid-cols-[repeat(auto-fit,minmax(112px,1fr))]');
    expect(within(grid).getByTestId('language-flag-en')).toBeInTheDocument();
    expect(within(grid).getByTestId('language-flag-es')).toBeInTheDocument();
    expect(within(grid).getByTestId('language-flag-ja')).toBeInTheDocument();
  });

  it('shows per-language segment readiness and lets a prepared language be reviewed', () => {
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

    expect(screen.getByTestId('multi-lang-progress-es')).toHaveTextContent('3/3');
    expect(screen.getByTestId('multi-lang-progress-ja')).toHaveTextContent('1/3');
    fireEvent.click(screen.getByTestId('multi-lang-select-ja'));
    expect(onSelect).toHaveBeenCalledWith('ja');
  });

  it('renders search results as responsive rows with a flag on every language', () => {
    render(<MultiLangPicker selected={[]} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button'));

    const allLanguages = screen.getByTestId('multi-lang-all-grid');
    expect(allLanguages.className).toContain('grid-cols-[repeat(auto-fit,minmax(140px,1fr))]');
    const rows = within(allLanguages).getAllByRole('button');
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.querySelector('[data-language-flag]')).not.toBeNull();
    }
  });
});
