import { FileText, Save, X, ChevronDown } from 'lucide-react';
import { Button, Menu } from '../../ui';
import DubPipelineStepper from './DubPipelineStepper';
import { formatTime } from '../../utils/format';

export default function DubHeader({
  t,
  dubFilename,
  dubDuration,
  dubSegments,
  activeProjectName,
  resetDub,
  closeDubAndSave,
  dubStep,
  pipelineSteps,
  onPipelineStep,
}) {
  return (
    <div
      className="dub-command-bar"
      data-testid="dub-command-bar"
      role="toolbar"
      aria-label={t('dub.video_dubbing_studio')}
    >
      <div className="dub-command-bar__identity">
        <span className="dub-command-bar__file" aria-hidden="true">
          <FileText size={13} />
        </span>
        <div className="min-w-0">
          <div className="dub-command-bar__title" title={dubFilename}>
            {dubFilename}
          </div>
          <div className="dub-command-bar__meta">
            <span>{formatTime(dubDuration)}</span>
            <span aria-hidden="true">·</span>
            <span>
              {dubSegments.length} {t('dub.segs')}
            </span>
            {activeProjectName && activeProjectName !== dubFilename && (
              <>
                <span aria-hidden="true">·</span>
                <span className="dub-command-bar__project" title={activeProjectName}>
                  {activeProjectName}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <DubPipelineStepper
        dubStep={dubStep}
        inline
        variant="command"
        selectableSteps={pipelineSteps}
        onStepSelect={onPipelineStep}
      />

      <div className="dub-command-bar__actions">
        <div className="dub-command-bar__utilities">
          <div className="inline-flex overflow-hidden rounded-[var(--chrome-radius-pill)] border border-[var(--chrome-border)]">
            <Button
              variant="subtle"
              size="sm"
              className="!rounded-none !border-0"
              onClick={closeDubAndSave}
              leading={<Save size={12} />}
            >
              {t('dub.close_and_save')}
            </Button>
            <Menu
              placement="bottom-end"
              width={196}
              items={[
                {
                  id: 'close-saved',
                  label: t('dub.close_and_save'),
                  icon: Save,
                  onSelect: closeDubAndSave,
                },
                {
                  id: 'close-unsaved',
                  label: t('dub.close_without_saving'),
                  icon: X,
                  destructive: true,
                  onSelect: resetDub,
                },
              ]}
            >
              <Button
                variant="subtle"
                size="sm"
                className="!rounded-none !border-0 border-l border-l-[var(--chrome-border)] !px-[6px]"
                aria-label={t('dub.close_and_save')}
                title={t('dub.close_and_save')}
              >
                <ChevronDown size={12} />
              </Button>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
}
