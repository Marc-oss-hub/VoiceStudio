import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import ProfileActivity from './ProfileActivity';
import ProfileDetails from './ProfileDetails';
import ProfileHeader from './ProfileHeader';
import { Wand2 } from 'lucide-react';

const t = i18n.t.bind(i18n);
const profile = {
  language: 'English',
  instruct: '',
  ref_text: 'This is the reference transcript.',
  is_locked: false,
  verified_own_voice: false,
};

describe('voice profile inspector', () => {
  it('keeps reference text in a closed disclosure and omits its redundant helper copy', () => {
    render(
      <ProfileDetails
        profile={profile}
        editing={false}
        draft={{}}
        setDraft={vi.fn()}
        saving={false}
        cancelEdits={vi.fn()}
        saveEdits={vi.fn()}
        onUnlock={vi.fn()}
        onRevokeConsent={vi.fn()}
        consentStatement="I confirm this is my voice."
        consentRec={{ isRecording: false, isCleaning: false, startRecording: vi.fn() }}
        consentSubmitting={false}
        t={t}
      />,
    );

    const summary = screen.getByText(t('voice_profile.ref_transcript'));
    const disclosure = summary.closest('details');
    expect(disclosure).not.toBeNull();
    expect(disclosure).not.toHaveAttribute('open');
    expect(screen.queryByText(t('voice_profile.ref_help'))).not.toBeInTheDocument();
  });

  it('keeps unused activity out of the primary workspace', () => {
    render(
      <ProfileActivity
        t={t}
        testText="Hello"
        setTestText={vi.fn()}
        testGenerating={false}
        runTest={vi.fn()}
        testAudioUrl=""
        autoPlayPreview={false}
        usage={null}
        onOpenProject={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: t('voice_profile.gen_preview') })).toBeEnabled();
    expect(screen.queryByText(t('voice_profile.used_title'))).not.toBeInTheDocument();
  });

  it('keeps the exact consent statement visible before recording', () => {
    render(
      <ProfileDetails
        profile={profile}
        editing={false}
        draft={{}}
        setDraft={vi.fn()}
        saving={false}
        cancelEdits={vi.fn()}
        saveEdits={vi.fn()}
        onUnlock={vi.fn()}
        onRevokeConsent={vi.fn()}
        consentStatement="I confirm this is my voice."
        consentRec={{ isRecording: false, isCleaning: false, startRecording: vi.fn() }}
        consentSubmitting={false}
        t={t}
      />,
    );

    expect(screen.getByText(/I confirm this is my voice/)).toBeVisible();
  });

  it('shows reproducibility metadata for a designed voice', () => {
    render(
      <ProfileHeader
        profile={{ ...profile, name: 'Atlas', seed: 4242 }}
        isDesign
        TypeIcon={Wand2}
        onBack={vi.fn()}
        editing={false}
        setEditing={vi.fn()}
        includeReference={false}
        setIncludeReference={vi.fn()}
        onExportPersona={vi.fn()}
        exporting={false}
        onDelete={vi.fn()}
        draft={{ name: 'Atlas' }}
        setDraft={vi.fn()}
        createdDate="Today"
        audioUrl=""
        t={t}
      />,
    );

    expect(screen.getByText(`${t('clone.seed_label')} 4242`)).toBeInTheDocument();
  });
});
