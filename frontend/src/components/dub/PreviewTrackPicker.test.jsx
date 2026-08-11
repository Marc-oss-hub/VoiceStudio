import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n';
import PreviewTrackPicker from './PreviewTrackPicker';

describe('PreviewTrackPicker', () => {
  it('uses a flag-based multi-column language grid for generated tracks', () => {
    const onChange = vi.fn();
    render(
      <PreviewTrackPicker
        value="es"
        tracks={['es', 'ja', 'fr']}
        onChange={onChange}
        label="Preview language"
        originalLabel="Original"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Preview language' }));

    const grid = screen.getByTestId('preview-track-grid');
    expect(grid.className).toContain('grid-cols-[repeat(auto-fit,minmax(140px,1fr))]');
    expect(within(grid).getByTestId('language-flag-es')).toBeInTheDocument();
    expect(within(grid).getByTestId('language-flag-ja')).toBeInTheDocument();

    fireEvent.click(within(grid).getByRole('button', { name: /Japanese/ }));
    expect(onChange).toHaveBeenCalledWith('ja');
    expect(screen.queryByRole('dialog', { name: 'Preview language' })).not.toBeInTheDocument();
  });

  it('can omit Original for a dub-only picker', () => {
    render(
      <PreviewTrackPicker
        value="es"
        tracks={['es', 'ja']}
        onChange={vi.fn()}
        label="Audio language"
        originalLabel="Original"
        searchLabel="Search tracks"
        includeOriginal={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Audio language' }));
    expect(screen.queryByRole('button', { name: 'Original' })).not.toBeInTheDocument();
  });

  it('keeps focus inside the open track dialog', () => {
    render(
      <PreviewTrackPicker
        value="es"
        tracks={['es', 'ja']}
        onChange={vi.fn()}
        label="Preview language"
        originalLabel="Original"
        searchLabel="Search tracks"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Preview language' }));
    const dialog = screen.getByRole('dialog', { name: 'Preview language' });
    const focusable = dialog.querySelectorAll('button:not([disabled]), input:not([disabled])');
    const last = focusable[focusable.length - 1];
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });

    expect(focusable[0]).toHaveFocus();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
