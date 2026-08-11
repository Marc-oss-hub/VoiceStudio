import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import ArchetypesZone from './ArchetypesZone';

vi.mock('../../api/hooks', () => ({
  useArchetypeCategories: () => ({
    data: [
      { id: 'narration', name: 'Narration & Story', icon: 'BookOpen' },
      { id: 'social', name: 'Social Media', icon: 'Radio' },
    ],
  }),
  useArchetypes: (filters) => ({
    data: filters.featured ? { items: [] } : { items: [], total: 0 },
    isLoading: false,
    isFetching: false,
  }),
}));

const t = (_key, options = {}) => options.defaultValue || _key;

const baseProps = {
  t,
  filters: {
    use_case: null,
    gender: null,
    age: null,
    pitch: null,
    accent: null,
    whisper: null,
    lang: null,
  },
  setFilter: vi.fn(),
  resetFilters: vi.fn(),
  favorites: [],
  toggleFavorite: vi.fn(),
  viewMode: 'grid',
  setViewMode: vi.fn(),
  playingId: null,
  loadingPreviewId: null,
  onPreview: vi.fn(),
  onUse: vi.fn(),
  onDesign: vi.fn(),
};

describe('ArchetypesZone filter toolbar', () => {
  it('keeps categories in one menu and reveals advanced filters on demand', () => {
    const setFilter = vi.fn();
    render(<ArchetypesZone {...baseProps} setFilter={setFilter} />);

    const categoryMenu = screen.getByRole('combobox', { name: 'Archetypes' });
    expect(screen.getAllByRole('combobox')).toHaveLength(1);

    fireEvent.change(categoryMenu, { target: { value: 'social' } });
    expect(setFilter).toHaveBeenCalledWith('use_case', 'social');

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getAllByRole('combobox')).toHaveLength(6);
    expect(screen.getByRole('checkbox', { name: 'Whisper' })).toBeInTheDocument();
  });
});
