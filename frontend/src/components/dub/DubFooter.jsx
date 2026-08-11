import { useEffect } from 'react';
import { Check, AlertCircle, Download, Loader, Play, ShieldCheck, Square, X } from 'lucide-react';
import { Badge, Button } from '../../ui';
import DubFailureNotice from './DubFailureNotice';
import FooterBtn from './FooterBtn';

// How long a translate/pipeline error banner lingers before it self-clears.
// Long enough to read a short message; the × and corrective-action clears are
// the primary escape hatches — this is the belt-and-suspenders timeout.
const ERROR_AUTOCLEAR_MS = 12000;

export default function DubFooter({
  t,
  dubStep,
  dubTracks,
  incrementalPlan,
  dubError,
  dubFailure,
  onDismissError,
  dubSegments,
  translateQuality,
  onExport,
  dubProgress,
  onGenerateClick,
  isTranslating,
  multiLangMode,
  multiLangs,
  handleDubGenerate,
  qcRunning,
  handleDubQc,
  onStop,
}) {
  // Auto-clear the error banner after a grace period so it can't get stuck
  // forever (issue: "TRANSLATION FAILED banner never goes away"). Skipped
  // while generating/stopping, where the banner accumulates live per-segment
  // errors the user needs to keep reading until the run ends.
  const canAutoClear =
    !!dubError && !!onDismissError && dubStep !== 'generating' && dubStep !== 'stopping';
  useEffect(() => {
    if (!canAutoClear) return undefined;
    const id = setTimeout(() => onDismissError(), ERROR_AUTOCLEAR_MS);
    return () => clearTimeout(id);
  }, [canAutoClear, dubError, onDismissError]);

  const generateLabel =
    multiLangMode && multiLangs.length > 1
      ? t('dub.generate_dub_multi', {
          count: multiLangs.length,
          defaultValue: 'Generate {{count}} dubs',
        })
      : t('dub.generate_dub');

  return (
    <div className="px-[var(--space-3)] py-[4px] shrink-0 bg-[var(--chrome-bg)] border border-transparent">
      {dubError && (
        <div className="mb-[var(--space-2)]">
          <span className="inline-flex items-center gap-[4px]">
            <Badge tone="danger">
              <AlertCircle size={11} /> {dubError}
            </Badge>
            {onDismissError && (
              <button
                type="button"
                className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] text-[var(--chrome-fg-muted,#a89984)] hover:text-[var(--chrome-fg,#ebdbb2)] hover:bg-[rgba(255,255,255,0.08)] bg-transparent border-none cursor-pointer shrink-0"
                onClick={onDismissError}
                title={t('dub.dismiss_error')}
                aria-label={t('dub.dismiss_error')}
              >
                <X size={12} />
              </button>
            )}
          </span>
          <DubFailureNotice failure={dubFailure} />
        </div>
      )}
      {(() => {
        // Pre-generation compression warning. Predicted by the
        // translate response (see services/speech_rate.rate_ratio
        // + dub_translate._maybe_cinematic), populated whenever
        // segments carry a slot_seconds and translated text.
        // Surfaces here so the user can act (re-translate in
        // Cinematic, edit text, allow longer slots) before
        // committing to a full Generate Dub run.
        const hot = dubSegments.filter((s) => (s.rate_ratio || 0) > 1.3);
        if (hot.length === 0 || !dubSegments.length) return null;
        const pctHot = Math.round((hot.length / dubSegments.length) * 100);
        if (pctHot < 10) return null;
        const worst = hot.reduce((a, b) => (a.rate_ratio > b.rate_ratio ? a : b));
        return (
          <div
            className="flex items-start gap-[8px] px-[10px] py-[6px] my-[4px] bg-[color-mix(in_srgb,#fabd2f_12%,transparent)] border border-transparent border-l-2 border-l-transparent rounded-[var(--chrome-radius-pill)] text-[0.72rem] text-[var(--chrome-fg)] leading-[1.35]"
            role="status"
          >
            <span className="text-[#fabd2f] text-[0.9rem] leading-none shrink-0">⚠</span>
            <span className="flex-1">
              <strong className="text-[#fabd2f] font-semibold">
                {hot.length} of {dubSegments.length}
              </strong>{' '}
              segments need {'>'}1.3× compression (worst:{' '}
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {worst.rate_ratio.toFixed(2)}×
              </span>
              ). Output will be intelligible (pitch-preserving stretch) but stressed —
              {translateQuality === 'fast'
                ? ' switch to Cinematic and Re-translate'
                : ' shorten the worst segments'}{' '}
              for cleaner audio.
            </span>
          </div>
        );
      })()}
      <div
        className="mt-[var(--space-2)] flex flex-wrap items-center gap-[8px] rounded-[6px] border border-solid border-[var(--chrome-border)] bg-[var(--chrome-panel-bg)] px-[10px] py-[6px]"
        data-testid="dub-workflow-actions"
      >
        {dubTracks.length > 0 ? (
          <div className="flex min-w-0 flex-1 items-center gap-[6px] overflow-hidden text-[0.7rem] text-[var(--chrome-fg-muted)]">
            {dubStep === 'done' ? (
              <Check
                className="shrink-0 text-[var(--color-success)]"
                size={12}
                aria-hidden="true"
              />
            ) : null}
            <span className="truncate">{t('dub.tracks_ready', { count: dubTracks.length })}</span>
            {incrementalPlan?.stale?.length > 0 ? (
              <Badge tone="warn">
                {t('dub.segments_changed', { count: incrementalPlan.stale.length })}
              </Badge>
            ) : null}
            {incrementalPlan?.stale?.length === 0 && incrementalPlan.fresh?.length > 0 ? (
              <span className="truncate text-[0.65rem] text-[var(--chrome-fg-dim)] max-[760px]:hidden">
                {t('dub.all_up_to_date', { count: incrementalPlan.fresh.length })}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-[6px]">
          {dubStep === 'stopping' ? (
            <FooterBtn
              sm
              tone="stopping"
              disabled
              className="!flex-none"
              icon={<Loader className="spinner" size={10} />}
              label={t('dub.stopping')}
            />
          ) : dubStep === 'generating' ? (
            <FooterBtn
              sm
              tone="danger"
              className="!flex-none"
              onClick={onStop}
              icon={<Square size={9} />}
              label={t('dub.stop_progress', {
                current: dubProgress.current,
                total: dubProgress.total,
              })}
            />
          ) : (
            <>
              <FooterBtn
                sm
                tone={dubStep === 'done' || !dubSegments.length || isTranslating ? 'idle' : 'pink'}
                className={`!flex-none ${dubStep !== 'done' && dubSegments.length && !isTranslating ? 'dub-generate-btn' : ''}`}
                onClick={onGenerateClick}
                disabled={!dubSegments.length || isTranslating}
                icon={<Play size={11} />}
                label={generateLabel}
                aria-label={generateLabel}
              />
              {dubStep === 'done' && incrementalPlan?.stale?.length > 0 ? (
                <FooterBtn
                  sm
                  tone="pink"
                  className="!flex-none"
                  onClick={() =>
                    handleDubGenerate({ regenOnly: incrementalPlan.stale, preview: true })
                  }
                  icon={<Play size={11} />}
                  label={t('dub.regen_changed', { count: incrementalPlan.stale.length })}
                />
              ) : null}
            </>
          )}
          {dubStep === 'done' ? (
            <FooterBtn
              sm
              tone="idle"
              className="!flex-none"
              disabled={qcRunning || !dubSegments.length}
              onClick={handleDubQc}
              icon={
                qcRunning ? <Loader className="spinner" size={11} /> : <ShieldCheck size={11} />
              }
              label={t('dub.verify', { defaultValue: 'Verify' })}
              aria-label={t('dub.qc_btn', {
                defaultValue: 'Verify dub timing (second-pass check)',
              })}
              title={t('dub.qc_btn', { defaultValue: 'Verify dub timing (second-pass check)' })}
            />
          ) : null}
          <div className="ml-[2px] border-l border-[var(--chrome-border)] pl-[7px]">
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="!h-[28px] !rounded-[var(--chrome-radius-pill)] !px-[9px] !font-[family-name:var(--chrome-font-mono)] !text-[0.62rem] !font-semibold !tracking-[0.04em]"
              disabled={dubStep !== 'done' && !dubSegments.length}
              onClick={onExport}
              aria-label={t('dub.export_btn')}
            >
              <Download size={11} />
              {t('dub.export_btn')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
