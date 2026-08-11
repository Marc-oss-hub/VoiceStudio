import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Plus } from 'lucide-react';
import { POPULAR_LANGS } from '../utils/constants';
import { LANG_CODES } from '../utils/languages';
import { useTranslation } from 'react-i18next';
import LanguageFlag from './LanguageFlag';

/**
 * MultiLangPicker — chip-based multi-language selector for batch dubbing.
 *
 * Shows selected languages as removable badges. Click "+" to open a
 * searchable dropdown with Popular + All Languages sections.
 */
export default function MultiLangPicker({
  selected = [], // array of { lang: string, code: string }
  onChange, // (newSelected) => void
  onSelect,
  activeCode = '',
  progressByCode = {},
  disabled = false,
}) {
  const { t } = useTranslation();
  const [dropOpen, setDropOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dropRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const [menuPos, setMenuPos] = useState(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e) => {
      const insidePicker = dropRef.current?.contains(e.target);
      const insideMenu = menuRef.current?.contains(e.target);
      if (!insidePicker && !insideMenu) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropOpen]);

  // The picker sits inside the Dub editor's overflow-hidden grid. Portal the
  // menu to the viewport and flip it above the trigger when the footer leaves
  // too little room below; z-index alone cannot escape ancestor clipping.
  useLayoutEffect(() => {
    if (!dropOpen) return;
    const place = () => {
      const el = dropRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const gap = 4;
      const edge = 8;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const below = viewportHeight - rect.bottom - gap - edge;
      const above = rect.top - gap - edge;
      const openUp = below < 220 && above > below;
      const available = Math.max(96, Math.min(260, openUp ? above : below));
      const width = Math.min(Math.max(rect.width, 260), viewportWidth - edge * 2);
      const left = Math.min(Math.max(edge, rect.left), viewportWidth - width - edge);
      setMenuPos(
        openUp
          ? { bottom: viewportHeight - rect.top + gap, left, width, maxHeight: available }
          : { top: rect.bottom + gap, left, width, maxHeight: available },
      );
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [dropOpen]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (dropOpen && inputRef.current) inputRef.current.focus();
  }, [dropOpen]);

  const selectedCodes = useMemo(() => new Set(selected.map((s) => s.code)), [selected]);

  const addLang = (lang, code) => {
    if (selectedCodes.has(code)) return;
    onChange([...selected, { lang, code }]);
    setQuery('');
  };

  const removeLang = (code) => {
    onChange(selected.filter((s) => s.code !== code));
  };

  const filteredLangs = useMemo(() => {
    const q = query.toLowerCase().trim();
    return LANG_CODES.filter(
      (lc) =>
        !selectedCodes.has(lc.code) &&
        (!q || lc.label.toLowerCase().includes(q) || lc.code.toLowerCase().includes(q)),
    );
  }, [query, selectedCodes]);

  const popularFiltered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return POPULAR_LANGS.map((lang) => {
      const match = LANG_CODES.find((lc) => lc.label.toLowerCase() === lang.toLowerCase());
      return match ? { lang, code: match.code } : null;
    }).filter(
      (item) =>
        item &&
        !selectedCodes.has(item.code) &&
        (!q || item.lang.toLowerCase().includes(q) || item.code.includes(q)),
    );
  }, [query, selectedCodes]);

  return (
    <div className="relative" ref={dropRef}>
      <div className="flex items-start gap-[5px] min-h-[28px]">
        {selected.length > 0 && (
          <div
            className="grid min-w-0 flex-1 grid-cols-[repeat(auto-fit,minmax(112px,1fr))] gap-[4px]"
            data-testid="multi-lang-selected-grid"
          >
            {selected.map((s) => {
              const progress = progressByCode[s.code];
              const complete = progress?.total > 0 && progress.ready === progress.total;
              return (
                <span
                  key={s.code}
                  className={`flex min-w-0 items-center gap-[3px] px-[4px] py-[3px] bg-[var(--chrome-hover-bg)] border border-solid rounded-[var(--chrome-radius-pill)] [font-family:var(--font-sans)] text-[0.68rem] font-medium text-[color:var(--chrome-fg)] ${activeCode === s.code ? 'border-[var(--color-brand)]' : 'border-transparent'}`}
                  title={s.lang}
                >
                  <button
                    type="button"
                    data-testid={`multi-lang-select-${s.code}`}
                    className="flex min-w-0 flex-1 items-center gap-[5px] border-0 bg-transparent p-0 text-inherit cursor-pointer disabled:cursor-default"
                    onClick={() => onSelect?.(s.code)}
                    disabled={!onSelect}
                    aria-pressed={activeCode === s.code}
                  >
                    <LanguageFlag code={s.code} />
                    <span className="min-w-0 flex-1 truncate text-left">{s.lang}</span>
                    <span className="[font-family:var(--font-mono)] text-[0.58rem] uppercase text-[color:var(--chrome-fg-dim)]">
                      {s.code}
                    </span>
                    {progress?.total > 0 && (
                      <span
                        data-testid={`multi-lang-progress-${s.code}`}
                        className={`[font-family:var(--font-mono)] text-[0.55rem] tabular-nums ${complete ? 'text-[var(--color-success)]' : 'text-[var(--chrome-fg-muted)]'}`}
                      >
                        {progress.ready}/{progress.total}
                      </span>
                    )}
                  </button>
                  {!disabled && (
                    <button
                      type="button"
                      className="bg-transparent border-0 text-[color:var(--chrome-fg-muted)] cursor-pointer p-0 flex shrink-0 items-center rounded-full [transition:color_0.15s] hover:text-danger"
                      onClick={() => removeLang(s.code)}
                      aria-label={`Remove ${s.lang}`}
                    >
                      <X size={8} />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}
        {!disabled && (
          <button
            type="button"
            className="flex shrink-0 items-center justify-center w-[24px] h-[24px] mt-[2px] rounded-full border border-dashed border-transparent bg-transparent text-[color:var(--chrome-fg-muted)] cursor-pointer [transition:all_0.15s] hover:bg-[var(--chrome-hover-bg)] hover:text-[color:var(--chrome-fg)] hover:border-solid"
            onClick={() => setDropOpen(!dropOpen)}
            title={t('dub.add_language')}
          >
            <Plus size={10} />
          </button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="[font-family:var(--font-mono)] text-[0.62rem] text-[color:var(--chrome-fg-dim)] mt-[4px]">
          {t('dub.languages_selected', { count: selected.length })}
        </div>
      )}

      {dropOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="multi-lang__drop multi-lang__drop--portal"
            style={menuPos || undefined}
            data-testid="multi-lang-dropdown"
          >
            <div className="flex items-center gap-[6px] px-[10px] py-[8px] border-b border-solid border-b-transparent text-[color:var(--chrome-fg-muted)]">
              <Search size={10} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('dub.search_languages')}
                spellCheck={false}
                className="flex-1 bg-transparent border-0 outline-none text-[color:var(--chrome-fg)] [font-family:var(--font-sans)] text-[0.78rem]"
              />
            </div>
            <div className="overflow-y-auto flex-1 py-[4px]">
              {popularFiltered.length > 0 && (
                <>
                  <div className="[font-family:var(--font-mono)] text-[0.62rem] font-semibold uppercase [letter-spacing:0.04em] text-[color:var(--chrome-fg-dim)] pt-[6px] px-[10px] pb-[2px]">
                    {t('dub.popular')}
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-[2px] px-[4px]">
                    {popularFiltered.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        className="flex min-w-0 items-center gap-[7px] rounded-[4px] px-[7px] py-[5px] bg-transparent border-0 text-[color:var(--chrome-fg)] [font-family:var(--font-sans)] text-[0.76rem] cursor-pointer text-left [transition:background_0.1s] hover:bg-[var(--chrome-hover-bg)]"
                        onClick={() => addLang(item.lang, item.code)}
                      >
                        <LanguageFlag code={item.code} />
                        <span className="[font-family:var(--font-mono)] text-[0.64rem] text-[color:var(--chrome-accent)] min-w-[24px] font-semibold uppercase">
                          {item.code}
                        </span>
                        <span className="min-w-0 truncate">{item.lang}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div className="[font-family:var(--font-mono)] text-[0.62rem] font-semibold uppercase [letter-spacing:0.04em] text-[color:var(--chrome-fg-dim)] pt-[6px] px-[10px] pb-[2px]">
                {t('dub.all_languages')}
              </div>
              <div
                className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-[2px] px-[4px]"
                data-testid="multi-lang-all-grid"
              >
                {filteredLangs.slice(0, 50).map((lc) => (
                  <button
                    key={lc.code}
                    type="button"
                    className="flex min-w-0 items-center gap-[7px] rounded-[4px] px-[7px] py-[5px] bg-transparent border-0 text-[color:var(--chrome-fg)] [font-family:var(--font-sans)] text-[0.76rem] cursor-pointer text-left [transition:background_0.1s] hover:bg-[var(--chrome-hover-bg)]"
                    onClick={() => addLang(lc.label, lc.code)}
                  >
                    <LanguageFlag code={lc.code} />
                    <span className="[font-family:var(--font-mono)] text-[0.64rem] text-[color:var(--chrome-accent)] min-w-[24px] font-semibold uppercase">
                      {lc.code}
                    </span>
                    <span className="min-w-0 truncate">{lc.label}</span>
                  </button>
                ))}
              </div>
              {filteredLangs.length > 50 && (
                <div className="px-[10px] py-[8px] text-[0.7rem] text-[color:var(--chrome-fg-dim)] text-center">
                  {t('dub.more_to_narrow', { count: filteredLangs.length - 50 })}
                </div>
              )}
              {filteredLangs.length === 0 && popularFiltered.length === 0 && (
                <div className="px-[10px] py-[8px] text-[0.7rem] text-[color:var(--chrome-fg-dim)] text-center">
                  {t('dub.no_matches')}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
