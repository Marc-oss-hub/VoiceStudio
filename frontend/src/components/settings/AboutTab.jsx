import React from 'react';
import {
  Info,
  CheckCircle,
  AlertCircle,
  Download,
  Activity,
  Copy,
  ExternalLink,
  Building2,
  KeyRound,
  MonitorCog,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { openExternal } from '../../api/external';
import { resolveAboutVersion } from '../../utils/appVersion';
import { REPO_URL } from '../../utils/bugReport';
import { Button, Badge } from '../../ui';
import { SettingsSection } from './primitives';
import { CATEGORY_BY_ID } from './settingsCategories';
import { useAppStore } from '../../store';
import { isTauri } from './native';

/**
 * Where a failing self-check can be fixed inside the app — diagnose check id
 * (backend/core/diagnose.py) → Settings category id. Checks without an in-app
 * fix (python, backend, …) render their hint as plain text only.
 */
const CHECK_FIX_CATEGORY = {
  ffmpeg: 'network',
  hf_token: 'credentials',
  disk: 'storage',
  data_dir: 'storage',
  engines: 'engines',
  gpu_routing: 'engines',
  device: 'performance',
  ram: 'performance',
  deep_synth: 'logs',
};

/** Small "Open <category>" deep-link into the Settings hub. */
function OpenCategoryButton({ categoryId }) {
  const { t } = useTranslation();
  const cat = CATEGORY_BY_ID[categoryId];
  if (!cat) return null;
  return (
    <Button
      size="sm"
      variant="subtle"
      onClick={() => useAppStore.getState().openSettingsTab(categoryId)}
    >
      {t('about.open_fix_category', {
        defaultValue: 'Open {{category}}',
        category: t(cat.labelKey, { defaultValue: cat.defaultLabel }),
      })}
    </Button>
  );
}

/**
 * Settings → About.
 *
 * Identity + diagnostics only. The device / RAM / VRAM / backend readouts moved
 * to Performance & Device; the data/outputs paths moved to Storage; the update
 * channel + endpoint moved to Updates (the single update home). What remains is
 * app identity, the HF-token quick status, and the diagnostics actions.
 */
export default function AboutTab({
  appVersion,
  tauriVersion,
  info,
  checkForUpdates,
  updateState,
  selfCheck,
  selfCheckRunning,
  runSelfCheck,
  bundleBuilding,
  saveDiagnosticBundle,
  copyDiagnostics,
}) {
  const { t } = useTranslation();
  const desktop = isTauri();
  const version = resolveAboutVersion(appVersion, info);

  return (
    <SettingsSection icon={Info} title={t('settings.about')}>
      <div className="overflow-hidden rounded-[calc(var(--chrome-radius-pill)*1.4)] bg-[color-mix(in_srgb,var(--chrome-accent)_7%,var(--chrome-bg))] p-[var(--space-5)]">
        <div className="flex flex-wrap items-center gap-[var(--space-4)]">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--chrome-radius-pill)] bg-[color-mix(in_srgb,var(--chrome-accent)_16%,var(--chrome-bg))] text-[var(--chrome-accent)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--chrome-accent)_22%,transparent)]">
            <Info size={22} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="m-0 text-[length:var(--text-lg)] font-semibold tracking-[-0.02em] text-[var(--chrome-fg)]">
              VoiceStudio
            </h3>
            <p className="m-0 mt-[3px] [font-family:var(--chrome-font-mono)] text-[length:var(--text-sm)] text-[var(--chrome-fg-muted)]">
              {t('about.version')} {version}
            </p>
          </div>
          <Badge tone="neutral">
            {desktop ? t('about.tauri_runtime') : t('about.web_preview')}
          </Badge>
        </div>
      </div>

      <dl className="my-[var(--space-4)] grid grid-cols-1 gap-[var(--space-3)] @min-[520px]/settings:grid-cols-2">
        <div className="rounded-[var(--chrome-radius-pill)] bg-[var(--chrome-hover-bg)] p-[var(--space-4)]">
          <dt className="flex items-center gap-[var(--space-2)] text-[length:var(--text-xs)] font-medium text-[var(--chrome-fg-dim)]">
            <MonitorCog size={13} aria-hidden="true" /> {t('about.tauri_runtime')}
          </dt>
          <dd className="m-0 mt-[var(--space-2)] break-words [font-family:var(--chrome-font-mono)] text-[length:var(--text-sm)] text-[var(--chrome-fg)]">
            {tauriVersion || (desktop ? '—' : t('about.web_preview'))}
          </dd>
        </div>
        <div className="rounded-[var(--chrome-radius-pill)] bg-[var(--chrome-hover-bg)] p-[var(--space-4)]">
          <dt className="flex items-center gap-[var(--space-2)] text-[length:var(--text-xs)] font-medium text-[var(--chrome-fg-dim)]">
            <KeyRound size={13} aria-hidden="true" /> {t('about.hf_token')}
          </dt>
          <dd className="m-0 mt-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-2)] text-[length:var(--text-sm)] text-[var(--chrome-fg)]">
            <Badge tone={info?.has_hf_token ? 'success' : 'neutral'}>
              {info?.has_hf_token ? t('about.yes') : t('about.no')}
            </Badge>
            {!info?.has_hf_token && <OpenCategoryButton categoryId="credentials" />}
          </dd>
        </div>
      </dl>

      <div className="settings-link-row grid grid-cols-1 gap-[var(--space-2)] @min-[460px]/settings:grid-cols-2 @min-[760px]/settings:grid-cols-3">
        {desktop && (
          <Button
            variant="primary"
            size="md"
            className="justify-start"
            leading={<Download size={12} />}
            onClick={checkForUpdates}
            loading={updateState === 'checking' || updateState === 'downloading'}
          >
            {updateState === 'downloading' ? t('about.downloading') : t('about.check_updates')}
          </Button>
        )}
        <Button
          variant="subtle"
          size="md"
          className="justify-start"
          leading={!selfCheckRunning && <Activity size={12} />}
          onClick={runSelfCheck}
          loading={selfCheckRunning}
        >
          {t('about.self_check')}
        </Button>
        <Button
          variant="subtle"
          size="md"
          className="justify-start"
          leading={!bundleBuilding && <Download size={12} />}
          onClick={saveDiagnosticBundle}
          loading={bundleBuilding}
        >
          {t('about.save_bundle')}
        </Button>
        <Button
          variant="subtle"
          size="md"
          className="justify-start"
          leading={<Copy size={12} />}
          onClick={copyDiagnostics}
        >
          {t('about.copy_diagnostics')}
        </Button>
        <Button
          variant="subtle"
          size="md"
          className="justify-start"
          leading={<ExternalLink size={12} />}
          onClick={() => openExternal(REPO_URL)}
        >
          {t('about.github')}
        </Button>
        <Button
          variant="subtle"
          size="md"
          className="justify-start"
          leading={<Building2 size={12} />}
          onClick={() => {
            useAppStore.getState().setMode?.('enterprise');
          }}
        >
          {t('about.commercial_license')}
        </Button>
      </div>
      {selfCheck && (
        <div className="settings-selfcheck mt-[var(--space-5)] rounded-[var(--chrome-radius-pill)] bg-[var(--chrome-hover-bg)] p-[var(--space-4)]">
          <div className="mb-[var(--space-2)] flex items-center gap-[var(--space-2)] text-[length:var(--text-sm)] font-semibold text-[var(--chrome-fg)]">
            {selfCheck.summary.ok ? (
              <CheckCircle size={15} className="text-[var(--color-success)]" aria-hidden="true" />
            ) : (
              <AlertCircle size={15} className="text-[var(--chrome-accent)]" aria-hidden="true" />
            )}
            {selfCheck.summary.ok
              ? t('about.self_check_healthy')
              : t('about.self_check_attention', { count: selfCheck.summary.failures })}
          </div>
          {selfCheck.checks.map((c) => (
            <div
              key={c.id}
              className="grid gap-[var(--space-2)] border-b border-transparent py-[var(--space-3)] last:border-0 @min-[560px]/settings:grid-cols-[minmax(0,1fr)_auto] @min-[560px]/settings:items-start"
            >
              <div className="min-w-0">
                <div className="text-[length:var(--text-sm)] font-medium text-[var(--chrome-fg)]">
                  {c.label}
                </div>
                <div className="mt-[2px] break-words text-[length:var(--text-xs)] leading-[1.5] text-[var(--chrome-fg-dim)]">
                  {c.detail}
                  {c.hint && <> — {c.hint}</>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-[var(--space-2)] @min-[560px]/settings:justify-end">
                <Badge
                  tone={c.status === 'ok' ? 'success' : c.status === 'warn' ? 'warn' : 'danger'}
                >
                  {c.status === 'ok' ? <CheckCircle size={11} /> : <AlertCircle size={11} />}{' '}
                  {t(`about.self_check_${c.status}`)}
                </Badge>
                {c.status !== 'ok' && CHECK_FIX_CATEGORY[c.id] && (
                  <OpenCategoryButton categoryId={CHECK_FIX_CATEGORY[c.id]} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SettingsSection>
  );
}
