import { render, screen, within } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import DubHeader from './DubHeader';

const t = i18n.t.bind(i18n);

describe('DubHeader command bar', () => {
  it('keeps project identity and pipeline clear of workflow actions', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DubHeader
          t={t}
          dubFilename="trying the WORLD'S SMALLEST curling iron."
          dubDuration={63.6}
          dubSegments={Array.from({ length: 14 }, (_, id) => ({ id: String(id) }))}
          activeProjectName=""
          saveProject={vi.fn()}
          resetDub={vi.fn()}
          dubStep="editing"
          pipelineSteps={[]}
          onPipelineStep={vi.fn()}
        />
      </I18nextProvider>,
    );

    const bar = screen.getByTestId('dub-command-bar');
    expect(within(bar).getByText("trying the WORLD'S SMALLEST curling iron.")).toBeInTheDocument();
    expect(within(bar).getByText('1:03.6')).toBeInTheDocument();
    expect(within(bar).getByText(/14 segs/i)).toBeInTheDocument();
    expect(within(bar).getByRole('list', { name: 'Dubbing pipeline' })).toHaveClass(
      'dub-stepper--command',
    );
    expect(within(bar).getByRole('button', { name: t('dub.save') })).toBeInTheDocument();
    expect(within(bar).getByRole('button', { name: t('dub.reset') })).toBeInTheDocument();
    expect(within(bar).queryByRole('button', { name: /Generate/i })).not.toBeInTheDocument();
    expect(bar).toHaveClass('dub-command-bar');
  });
});
