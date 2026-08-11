import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n';
import PreviewTrackPicker from './PreviewTrackPicker';

describe('PreviewTrackPicker', () => {
  it('uses the flag-based multi-column language grid for generated tracks', () => {
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
});
