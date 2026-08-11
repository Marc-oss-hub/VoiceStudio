import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { fireEvent, render, screen, act, within } from '@testing-library/react';
import i18n from '../i18n';

import DubFooter from '../components/dub/DubFooter';

const t = i18n.t.bind(i18n);

function makeProps(over = {}) {
  return {
    t,
    dubStep: 'editing',
    dubTracks: [],
    incrementalPlan: null,
    dubError: 'TRANSLATION FAILED: 400 — deep_translator not installed',
    dubFailure: null,
    onDismissError: vi.fn(),
    exportTracks: {},
    setExportTracks: vi.fn(),
    dubSegments: [],
    translateQuality: 'fast',
    onExport: vi.fn(),
    dubProgress: { current: 0, total: 0 },
    onGenerateClick: vi.fn(),
    isTranslating: false,
    multiLangMode: false,
    multiLangs: [],
    handleDubGenerate: vi.fn(),
    qcRunning: false,
    handleDubQc: vi.fn(),
    onStop: vi.fn(),
    ...over,
  };
}

describe('DubFooter — dismissable / auto-clearing translation error banner', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a dismiss button that clears the error (× → onDismissError)', () => {
    const onDismissError = vi.fn();
    render(<DubFooter {...makeProps({ onDismissError })} />);
    expect(screen.getByText(/TRANSLATION FAILED/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t('dub.dismiss_error') }));
    expect(onDismissError).toHaveBeenCalledTimes(1);
  });

  it('auto-clears the banner after the timeout while editing', () => {
    vi.useFakeTimers();
    const onDismissError = vi.fn();
    render(<DubFooter {...makeProps({ onDismissError, dubStep: 'editing' })} />);
    expect(onDismissError).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(12000);
    });
    expect(onDismissError).toHaveBeenCalledTimes(1);
  });

  it('does NOT auto-clear while generating (live per-segment errors must persist)', () => {
    vi.useFakeTimers();
    const onDismissError = vi.fn();
    render(<DubFooter {...makeProps({ onDismissError, dubStep: 'generating' })} />);
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(onDismissError).not.toHaveBeenCalled();
    // …but the × is still available for a manual dismiss.
    fireEvent.click(screen.getByRole('button', { name: t('dub.dismiss_error') }));
    expect(onDismissError).toHaveBeenCalledTimes(1);
  });

  it('no banner, no dismiss button when there is no error', () => {
    render(<DubFooter {...makeProps({ dubError: '' })} />);
    expect(screen.queryByRole('button', { name: t('dub.dismiss_error') })).not.toBeInTheDocument();
  });

  it('summarises finished tracks instead of rendering a checkbox wall', () => {
    const onExport = vi.fn();
    render(
      <DubFooter
        {...makeProps({
          dubStep: 'done',
          dubError: '',
          dubTracks: ['es', 'fr', 'de'],
          incrementalPlan: { stale: [], fresh: [{}, {}] },
          onExport,
        })}
      />,
    );

    const row = screen.getByTestId('dub-workflow-actions');
    expect(within(row).getByText(t('dub.tracks_ready', { count: 3 }))).toBeInTheDocument();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: t('dub.export_btn') }));
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('keeps generation, verification, and export together below the workspace', () => {
    const onGenerateClick = vi.fn();
    const handleDubQc = vi.fn();
    const onExport = vi.fn();
    render(
      <DubFooter
        {...makeProps({
          dubStep: 'done',
          dubError: '',
          dubTracks: ['es'],
          dubSegments: [{ id: '1' }],
          incrementalPlan: { stale: [], fresh: Array.from({ length: 14 }) },
          onGenerateClick,
          handleDubQc,
          onExport,
        })}
      />,
    );

    const row = screen.getByTestId('dub-workflow-actions');
    expect(within(row).getByText(t('dub.tracks_ready', { count: 1 }))).toBeInTheDocument();
    expect(within(row).getByText(t('dub.all_up_to_date', { count: 14 }))).toBeInTheDocument();
    fireEvent.click(within(row).getByRole('button', { name: t('dub.generate_dub') }));
    const verify = within(row).getByRole('button', { name: t('dub.qc_btn') });
    expect(verify).toHaveTextContent(t('dub.verify'));
    fireEvent.click(verify);
    fireEvent.click(within(row).getByRole('button', { name: t('dub.export_btn') }));
    expect(onGenerateClick).toHaveBeenCalledOnce();
    expect(handleDubQc).toHaveBeenCalledOnce();
    expect(onExport).toHaveBeenCalledOnce();
  });
});
