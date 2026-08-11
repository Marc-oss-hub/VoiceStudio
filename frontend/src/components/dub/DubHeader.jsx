import { FileText, Save, RotateCcw } from 'lucide-react';
import { Button } from '../../ui';
import DubPipelineStepper from './DubPipelineStepper';
import { formatTime } from '../../utils/format';

export default function DubHeader({
  t,
  dubFilename,
  dubDuration,
  dubSegments,
  activeProjectName,
  saveProject,
  resetDub,
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
          <Button variant="subtle" size="sm" onClick={saveProject} leading={<Save size={12} />}>
            {t('dub.save')}
          </Button>
          <Button variant="danger" size="sm" onClick={resetDub} leading={<RotateCcw size={12} />}>
            {t('dub.reset')}
          </Button>
        </div>
      </div>
    </div>
  );
}
