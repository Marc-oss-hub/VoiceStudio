import { Suspense, lazy, useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Clock3,
  FileText,
  ClipboardPaste,
  Mic2,
  SlidersHorizontal,
} from 'lucide-react';
import { Button, Segmented } from '../../ui';
import GlossaryPanel from '../GlossaryPanel';
import CheckpointBanner from '../CheckpointBanner';
import { LANG_CODES } from '../../utils/languages';
import { autoProfileId } from '../../utils/segments';
import PreviewTrackPicker from './PreviewTrackPicker';

const DubSegmentTable = lazy(() => import('../DubSegmentTable'));
const DubPasteTranslationDialog = lazy(() => import('./DubPasteTranslationDialog'));

const LazyFallback = () => <div className="p-[12px] text-[#6b6657] text-[0.7rem]">Loading…</div>;

// ── Output-options + bulk-select utility clusters ────────────────────────
const OUT_ROW =
  'flex min-w-0 flex-wrap items-center gap-x-[var(--space-3)] gap-y-[6px] text-[length:var(--text-xs)] text-[var(--chrome-fg-muted)] font-[family-name:var(--font-sans)]';
const OUT_LABEL =
  'inline-flex h-[24px] items-center gap-[5px] rounded-[var(--chrome-radius-pill)] px-[5px] cursor-pointer transition-colors hover:bg-[var(--chrome-hover-bg)] hover:text-[var(--chrome-fg)]';
const OUT_TITLE =
  'font-[family-name:var(--chrome-font-mono)] text-[length:var(--chrome-label-size)] font-semibold uppercase tracking-[var(--chrome-label-track)] text-[var(--chrome-fg-muted)]';
const CHK = 'accent-[var(--color-brand)]';
const BULK_SELECT = 'input-base !text-[0.62rem] !px-[4px] !py-[2px]';
const SETTINGS_HEADING =
  'inline-flex shrink-0 items-center gap-[5px] [font-family:var(--chrome-font-mono)] text-[length:var(--chrome-label-size)] font-semibold uppercase tracking-[var(--chrome-label-track)] text-[var(--chrome-fg-muted)]';

export default function DubRightColumn({
  t,
  preserveBg,
  setPreserveBg,
  dualSubs,
  setDualSubs,
  burnSubs,
  setBurnSubs,
  defaultTrack,
  setDefaultTrack,
  dubLangCode,
  multiLangMode,
  batchTargets,
  multiBatchBusy,
  setDubLang,
  setDubLangCode,
  dubTracks,
  timingStrategy,
  setTimingStrategy,
  voiceMatch,
  setVoiceMatch,
  dubTranscript,
  showTranscript,
  setShowTranscript,
  dubJobId,
  glossaryVisible,
  setGlossaryOpen,
  setGlossaryHidden,
  glossaryTermCount,
  dubLang,
  dubSegments,
  onGlossaryChange,
  selectedSegIds,
  bulkApplyToSelected,
  speakerClones,
  profiles,
  clearSegSelection,
  bulkDeleteSelected,
  showCheckpoint,
  checkpointStage,
  onCheckpointContinue,
  onCheckpointDismiss,
  isTranslating,
  segmentPreviewLoading,
  toggleSegSelect,
  selectAllSegs,
  segmentEditField,
  segmentDelete,
  segmentRestoreOriginal,
  handleSegmentPreview,
  onDirectSegment,
  segmentSplit,
  segmentMerge,
  seekWaveform,
  timelineSelSegId,
  dubStep,
  dubProgress,
  pasteTranslations,
}) {
  const [pasteOpen, setPasteOpen] = useState(false);
  return (
    <div className="studio-panel dub-panel-col">
      <section className="mb-[6px] overflow-hidden rounded-[6px] border border-[var(--chrome-border)] bg-[var(--chrome-panel-bg)]">
        <div className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[5px] px-[8px] py-[6px]">
          <span className={SETTINGS_HEADING}>
            <SlidersHorizontal size={10} /> {t('dub.output_options')}
          </span>
          <div className={OUT_ROW}>
            <label className={OUT_LABEL}>
              <input
                type="checkbox"
                className={CHK}
                checked={preserveBg}
                onChange={(e) => setPreserveBg(e.target.checked)}
              />{' '}
              {t('dub.mix_bg_audio')}
            </label>
            <label className={OUT_LABEL} title={t('dub.dual_subs_title')}>
              <input
                type="checkbox"
                className={CHK}
                checked={!!dualSubs}
                onChange={(e) => setDualSubs(e.target.checked)}
              />{' '}
              {t('dub.dual_subs')}
            </label>
            <label className={OUT_LABEL} title={t('dub.burn_subs_title')}>
              <input
                type="checkbox"
                className={CHK}
                checked={!!burnSubs}
                onChange={(e) => setBurnSubs(e.target.checked)}
              />{' '}
              {t('dub.burn_subs')}
            </label>
          </div>
        </div>
        <div className="border-t border-[var(--chrome-border)] px-[8px] py-[6px]">
          <PreviewTrackPicker
            value={defaultTrack}
            tracks={dubTracks}
            onChange={setDefaultTrack}
            label={t('dub.default_track')}
            originalLabel={t('dub.original_track')}
            searchLabel={t('common.search')}
            getTooltip={(code) => t('dub.dub_track', { code })}
          />
        </div>
        <div className="grid gap-[6px] border-t border-[var(--chrome-border)] px-[8px] py-[6px] min-[760px]:grid-cols-2">
          <div
            className={OUT_ROW}
            title="Timing strategy — how the dub reconciles natural-rate TTS with the original timeline."
          >
            <span className={SETTINGS_HEADING}>
              <Clock3 size={10} /> {t('dub.timing')}
            </span>
            <Segmented
              value={timingStrategy}
              onChange={setTimingStrategy}
              items={[
                {
                  value: 'concise',
                  label: t('dub.timing_concise'),
                  title:
                    'Translator trims text to fit at natural rate. Overflows surface in the row badge so you can shorten the segment.',
                },
                {
                  value: 'smart_fit',
                  label: t('dub.timing_smart_fit'),
                  title: t('dub.timing_smart_fit_title'),
                },
                {
                  value: 'stretch_video',
                  label: t('dub.timing_stretch_video'),
                  title:
                    'Audio plays at natural rate; each segment of the video is stretched (per-segment ffmpeg setpts) to fit. Total video duration grows. Requires a re-encode pass.',
                },
                {
                  value: 'strict_slot',
                  label: t('dub.timing_strict_slot'),
                  title:
                    'Legacy: compress audio to fit the original timing. Can sound rushed/chipmunky on high-density target languages.',
                },
              ]}
            />
          </div>
          <div className={OUT_ROW} title={t('dub.voice_match_title')}>
            <span className={SETTINGS_HEADING}>
              <Mic2 size={10} /> {t('dub.voice_match')}
            </span>
            <Segmented
              value={voiceMatch}
              onChange={setVoiceMatch}
              items={[
                {
                  value: 'per_line',
                  label: t('dub.voice_match_per_line'),
                  title: t('dub.voice_match_per_line_title'),
                },
                {
                  value: 'consistent',
                  label: t('dub.voice_match_consistent'),
                  title: t('dub.voice_match_consistent_title'),
                },
              ]}
            />
          </div>
        </div>
      </section>

      <div className="mb-[4px] flex min-h-[28px] flex-wrap items-center gap-[4px] border-y border-[var(--chrome-border)] px-[4px] py-[3px]">
        {dubTranscript ? (
          <button
            type="button"
            className="inline-flex items-center gap-[4px] rounded-[var(--chrome-radius-pill)] border border-transparent bg-transparent px-[6px] py-[3px] [font-family:var(--chrome-font-mono)] text-[length:var(--chrome-label-size)] font-semibold uppercase tracking-[var(--chrome-label-track)] text-[var(--chrome-fg-muted)] transition-colors hover:bg-[var(--chrome-hover-bg)] hover:text-[var(--chrome-fg)]"
            onClick={() => setShowTranscript(!showTranscript)}
            aria-expanded={showTranscript}
          >
            <FileText size={10} /> {t('dub.transcript')}
            {showTranscript ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
        ) : null}
        {dubJobId && !glossaryVisible ? (
          <button
            type="button"
            className="inline-flex items-center rounded-[var(--chrome-radius-pill)] border border-transparent bg-transparent px-[6px] py-[3px] [font-family:var(--chrome-font-mono)] text-[length:var(--chrome-label-size)] font-semibold uppercase tracking-[var(--chrome-label-track)] text-[var(--chrome-fg-muted)] transition-colors hover:bg-[var(--chrome-hover-bg)] hover:text-[var(--chrome-fg)]"
            onClick={() => {
              setGlossaryOpen(true);
              setGlossaryHidden(false);
            }}
            title={t('dub.glossary_title')}
          >
            {t('dub.glossary_btn', { count: glossaryTermCount })}
          </button>
        ) : null}
        {pasteTranslations ? (
          <Button
            variant="subtle"
            size="sm"
            className="ml-auto"
            onClick={() => setPasteOpen(true)}
            disabled={!dubSegments.length}
            title={t('dub.paste_translation_title')}
            leading={<ClipboardPaste size={10} />}
          >
            {t('dub.paste_translation_btn')}
          </Button>
        ) : null}
      </div>
      {showTranscript && dubTranscript ? (
        <div className="mb-[4px] max-h-[80px] overflow-y-auto rounded-b-[var(--chrome-radius-pill)] border border-t-0 border-[var(--chrome-border)] bg-[var(--chrome-bg)] p-[var(--space-3)] text-[length:var(--text-xs)] leading-[1.5] text-[var(--chrome-fg-muted)]">
          {dubTranscript}
        </div>
      ) : null}

      {/* Phase 1.3 — Project glossary. Expanded only on request. */}
      {dubJobId && glossaryVisible && (
        <div className="mb-[4px]">
          <GlossaryPanel
            projectId={dubJobId}
            sourceLang={dubLangCode && dubLang ? dubLang.slice(0, 2).toLowerCase() || 'en' : 'en'}
            targetLang={dubLangCode}
            segments={dubSegments}
            onChange={onGlossaryChange}
            onClose={() => {
              setGlossaryHidden(true);
              setGlossaryOpen(false);
            }}
          />
        </div>
      )}

      {/* "Apply Voice to All" row removed 2026-04-21 — redundant
                  with the CAST strip in the left column, which does the same
                  thing per-speaker (and handles the multi-speaker case cleanly). */}

      {selectedSegIds.size > 0 && (
        <div className="flex items-center gap-[var(--space-3)] px-[6px] py-[3px] rounded-[var(--radius-md)] mb-[var(--space-2)] text-[length:var(--text-xs)] bg-[rgba(211,134,155,0.08)] border border-transparent">
          <span className="text-brand font-bold whitespace-nowrap">
            {t('dub.selected_count', { count: selectedSegIds.size })}
          </span>
          <select
            className={`${BULK_SELECT} min-w-[72px] flex-[1_1_100px]`}
            value=""
            onChange={(e) => {
              const v = e.target.value;
              if (v === '__clear__') bulkApplyToSelected({ profile_id: '' });
              else if (v) bulkApplyToSelected({ profile_id: v });
            }}
          >
            <option value="">{t('dub.set_voice')}</option>
            <option value="__clear__">{t('dub.clear_voice')}</option>
            {speakerClones && Object.keys(speakerClones).length > 0 && (
              <optgroup label={t('dub.cast')}>
                {Object.keys(speakerClones).map((spk) => {
                  const autoId = autoProfileId(spk);
                  return (
                    <option key={autoId} value={autoId}>
                      🎤 {spk}
                    </option>
                  );
                })}
              </optgroup>
            )}
            {profiles.filter((p) => !p.instruct).length > 0 && (
              <optgroup label={t('dub.clone_profiles')}>
                {profiles
                  .filter((p) => !p.instruct)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </optgroup>
            )}
            {profiles.filter((p) => !!p.instruct).length > 0 && (
              <optgroup label={t('dub.design_presets')}>
                {profiles
                  .filter((p) => !!p.instruct)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </optgroup>
            )}
          </select>
          <select
            className={`${BULK_SELECT} !w-auto min-w-[64px] flex-[0_1_90px]`}
            value=""
            onChange={(e) => {
              if (e.target.value === '__def__') bulkApplyToSelected({ target_lang: null });
              else if (e.target.value) bulkApplyToSelected({ target_lang: e.target.value });
            }}
          >
            <option value="">{t('dub.set_lang')}</option>
            <option value="__def__">{t('dub.default_lang')}</option>
            {LANG_CODES.map((lc) => (
              <option key={lc.code} value={lc.code}>
                {lc.code.toUpperCase()}
              </option>
            ))}
          </select>
          <Button variant="danger" size="sm" onClick={bulkDeleteSelected}>
            {t('dub.delete_selected')}
          </Button>
          <Button variant="ghost" size="sm" onClick={clearSegSelection} className="ml-auto">
            {t('dub.clear_selection')}
          </Button>
        </div>
      )}

      {showCheckpoint && (
        <CheckpointBanner
          stage={checkpointStage}
          count={dubSegments.length}
          onContinue={checkpointStage === 'done' ? null : onCheckpointContinue}
          onDismiss={onCheckpointDismiss}
          continueLoading={isTranslating}
        />
      )}

      {multiLangMode && batchTargets?.length > 1 && (
        <div className="flex items-center gap-[4px] mb-[4px] px-[2px] flex-wrap">
          <span className={OUT_TITLE}>{t('dub.language')}:</span>
          {batchTargets.map((target) => (
            <button
              key={target.code}
              type="button"
              className={`px-[7px] py-[2px] rounded-full border text-[0.62rem] font-mono cursor-pointer transition-[background,color,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chrome-accent)] disabled:cursor-not-allowed disabled:opacity-50 ${
                dubLangCode === target.code
                  ? 'bg-[var(--chrome-hover-bg)] text-[var(--chrome-fg)] border-[var(--chrome-accent)]'
                  : 'bg-transparent text-[var(--chrome-fg-muted)] border-transparent hover:bg-[var(--chrome-hover-bg)] hover:text-[var(--chrome-fg)]'
              }`}
              onClick={() => {
                setDubLang(target.lang);
                setDubLangCode(target.code);
              }}
              disabled={multiBatchBusy}
              aria-pressed={dubLangCode === target.code}
              title={target.lang}
            >
              {target.code.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {pasteOpen && (
        <Suspense fallback={null}>
          <DubPasteTranslationDialog
            open
            segments={dubSegments}
            onApply={pasteTranslations}
            onClose={() => setPasteOpen(false)}
          />
        </Suspense>
      )}

      <Suspense fallback={<LazyFallback />}>
        <DubSegmentTable
          segments={dubSegments}
          profiles={profiles}
          speakerClones={speakerClones}
          dubStep={dubStep}
          dubProgress={dubProgress}
          previewLoadingId={segmentPreviewLoading}
          selectedIds={selectedSegIds}
          onSelect={toggleSegSelect}
          onSelectAll={selectAllSegs}
          onClearSelection={clearSegSelection}
          onEditField={segmentEditField}
          onDelete={segmentDelete}
          onRestore={segmentRestoreOriginal}
          onPreview={handleSegmentPreview}
          onDirect={onDirectSegment}
          onSplit={segmentSplit}
          onMerge={segmentMerge}
          onSeek={seekWaveform}
          timelineSelectedId={timelineSelSegId}
        />
      </Suspense>
    </div>
  );
}
