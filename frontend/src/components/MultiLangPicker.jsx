import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, X } from 'lucide-react';
import { POPULAR_LANGS } from '../utils/constants';
import { LANG_CODES } from '../utils/languages';
import { useTranslation } from 'react-i18next';
import LanguageCode from './LanguageCode';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/** Compact multi-language selector for batch dubbing. */
export default function MultiLangPicker({
  selected = [],
  onChange,
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
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const menuId = useId();
  const [menuPos, setMenuPos] = useState(null);

  useEffect(() => {
    if (!dropOpen) return undefined;
    const onMouseDown = (event) => {
      const insideTrigger = dropRef.current?.contains(event.target);
      const insideMenu = menuRef.current?.contains(event.target);
      if (!insideTrigger && !insideMenu) setDropOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDropOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...(menuRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || [])];
      if (!focusable.length) {
        event.preventDefault();
        menuRef.current?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable.at(-1);
      if (
        event.shiftKey &&
        (document.activeElement === first || !menuRef.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [dropOpen]);

  // Portal outside clipping panels and flip at either viewport edge.
  useLayoutEffect(() => {
    if (!dropOpen) return undefined;
    const place = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const margin = 8;
      const gap = 4;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const width = Math.min(Math.max(rect.width, 220), viewportWidth - margin * 2);
      const left = Math.min(
        Math.max(margin, rect.left),
        Math.max(margin, viewportWidth - width - margin),
      );
      const below = viewportHeight - rect.bottom - gap - margin;
      const above = rect.top - gap - margin;
      const openUp = below < 260 && above > below;
      const maxHeight = Math.max(0, Math.min(260, openUp ? above : below));
      setMenuPos(
        openUp
          ? { bottom: viewportHeight - rect.top + gap, left, width, maxHeight }
          : { top: rect.bottom + gap, left, width, maxHeight },
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

  useEffect(() => {
    if (!dropOpen) return;
    const prefersKeyboard = window.matchMedia?.('(pointer: fine)').matches ?? true;
    (prefersKeyboard ? inputRef.current : menuRef.current)?.focus();
  }, [dropOpen]);

  const selectedCodes = useMemo(() => new Set(selected.map((item) => item.code)), [selected]);
  const filteredLangs = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return LANG_CODES.filter(
      (language) =>
        !selectedCodes.has(language.code) &&
        (!normalizedQuery ||
          language.label.toLowerCase().includes(normalizedQuery) ||
          language.code.toLowerCase().includes(normalizedQuery)),
    );
  }, [query, selectedCodes]);
  const popularFiltered = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return POPULAR_LANGS.map((name) => {
      const match = LANG_CODES.find(
        (language) => language.label.toLowerCase() === name.toLowerCase(),
      );
      return match ? { lang: name, code: match.code } : null;
    }).filter(
      (item) =>
        item &&
        !selectedCodes.has(item.code) &&
        (!normalizedQuery ||
          item.lang.toLowerCase().includes(normalizedQuery) ||
          item.code.includes(normalizedQuery)),
    );
  }, [query, selectedCodes]);

  const addLang = (lang, code) => {
    if (selectedCodes.has(code)) return;
    onChange?.([...selected, { lang, code }]);
    setQuery('');
  };
  const removeLang = (code) => onChange?.(selected.filter((item) => item.code !== code));

  const renderLanguageOption = (item) => (
    <button
      key={item.code}
      type="button"
      className="flex min-w-0 items-center gap-[7px] rounded-[4px] px-[7px] py-[5px] bg-transparent border-0 text-[color:var(--chrome-fg)] [font-family:var(--font-sans)] text-[0.76rem] cursor-pointer text-left [transition:background_0.1s] hover:bg-[var(--chrome-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--chrome-accent)]"
      onClick={() => addLang(item.lang ?? item.label, item.code)}
    >
      <LanguageCode code={item.code} />
      <span className="[font-family:var(--font-mono)] text-[0.64rem] text-[color:var(--chrome-accent)] min-w-[24px] font-semibold uppercase">
        {item.code}
      </span>
      <span className="min-w-0 truncate">{item.lang ?? item.label}</span>
    </button>
  );

  return (
    <div className="relative" ref={dropRef}>
      {!disabled ? (
        <button
          ref={triggerRef}
          type="button"
          className="flex w-full min-w-0 items-center gap-[7px] rounded-[4px] border border-solid border-transparent bg-[var(--chrome-hover-bg)] px-[8px] py-[5px] text-left text-[0.7rem] text-[color:var(--chrome-fg)] cursor-pointer hover:border-[var(--chrome-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chrome-accent)]"
          onClick={() => setDropOpen((open) => !open)}
          title={t('dub.add_language')}
          aria-label={t('dub.add_language')}
          aria-haspopup="dialog"
          aria-expanded={dropOpen}
          aria-controls={dropOpen ? menuId : undefined}
        >
          <Plus size={11} aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">
            {selected.length > 0
              ? t('dub.languages_selected', { count: selected.length })
              : t('dub.add_language')}
          </span>
          {activeCode ? (
            <span className="[font-family:var(--font-mono)] text-[0.58rem] uppercase text-[color:var(--chrome-accent)]">
              {activeCode}
            </span>
          ) : null}
        </button>
      ) : selected.length > 0 ? (
        <div className="px-[8px] py-[5px] text-[0.7rem] text-[color:var(--chrome-fg-muted)]">
          {t('dub.languages_selected', { count: selected.length })}
        </div>
      ) : null}

      {dropOpen
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              className="multi-lang__drop"
              role="dialog"
              aria-modal="true"
              aria-label={t('dub.add_language')}
              tabIndex={-1}
              data-testid="multi-lang-dropdown"
              style={
                menuPos
                  ? {
                      left: menuPos.left,
                      width: menuPos.width,
                      maxHeight: menuPos.maxHeight,
                      ...(menuPos.bottom != null
                        ? { bottom: menuPos.bottom }
                        : { top: menuPos.top }),
                    }
                  : { visibility: 'hidden' }
              }
            >
              <div className="flex items-center gap-[6px] px-[10px] py-[8px] border-b border-solid border-b-transparent text-[color:var(--chrome-fg-muted)]">
                <Search size={10} aria-hidden="true" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('dub.search_languages')}
                  aria-label={t('dub.search_languages')}
                  name="language-search"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent border-0 text-[color:var(--chrome-fg)] [font-family:var(--font-sans)] text-[0.78rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chrome-accent)]"
                />
              </div>
              <div className="overflow-y-auto overscroll-contain flex-1 py-[4px]">
                {selected.length > 0 ? (
                  <>
                    <div className="[font-family:var(--font-mono)] text-[0.62rem] font-semibold uppercase [letter-spacing:0.04em] text-[color:var(--chrome-fg-dim)] pt-[4px] px-[10px] pb-[2px]">
                      {t('dub.languages_selected', { count: selected.length })}
                    </div>
                    <div
                      className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-[2px] px-[4px] pb-[4px] border-b border-solid border-b-[var(--chrome-border)]"
                      data-testid="multi-lang-selected-grid"
                    >
                      {selected.map((item) => {
                        const progress = progressByCode[item.code];
                        const complete = progress?.total > 0 && progress.ready === progress.total;
                        return (
                          <span
                            key={item.code}
                            className={`flex min-w-0 items-center gap-[4px] rounded-[4px] px-[7px] py-[5px] text-[0.72rem] ${activeCode === item.code ? 'bg-[color-mix(in_srgb,var(--color-brand)_12%,transparent)] text-[var(--chrome-fg)]' : 'text-[var(--chrome-fg-muted)]'}`}
                          >
                            <button
                              type="button"
                              data-testid={`multi-lang-select-${item.code}`}
                              className="flex min-w-0 flex-1 items-center gap-[6px] border-0 bg-transparent p-0 text-inherit cursor-pointer disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chrome-accent)]"
                              onClick={() => onSelect?.(item.code)}
                              disabled={!onSelect}
                              aria-pressed={activeCode === item.code}
                            >
                              <LanguageCode code={item.code} />
                              <span className="min-w-0 flex-1 truncate text-left">{item.lang}</span>
                              <span className="[font-family:var(--font-mono)] text-[0.58rem] uppercase text-[color:var(--chrome-fg-dim)]">
                                {item.code}
                              </span>
                              {progress?.total > 0 ? (
                                <span
                                  data-testid={`multi-lang-progress-${item.code}`}
                                  className={`[font-family:var(--font-mono)] text-[0.55rem] tabular-nums ${complete ? 'text-[var(--color-success)]' : 'text-[var(--chrome-fg-muted)]'}`}
                                >
                                  {progress.ready}/{progress.total}
                                </span>
                              ) : null}
                            </button>
                            <button
                              type="button"
                              className="flex shrink-0 items-center rounded-full border-0 bg-transparent p-0 text-[color:var(--chrome-fg-muted)] cursor-pointer hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chrome-accent)]"
                              onClick={() => removeLang(item.code)}
                              aria-label={t('common.remove', { term: item.lang })}
                            >
                              <X size={9} aria-hidden="true" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </>
                ) : null}
                {popularFiltered.length > 0 ? (
                  <>
                    <div className="[font-family:var(--font-mono)] text-[0.62rem] font-semibold uppercase [letter-spacing:0.04em] text-[color:var(--chrome-fg-dim)] pt-[6px] px-[10px] pb-[2px]">
                      {t('dub.popular')}
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-[2px] px-[4px]">
                      {popularFiltered.map(renderLanguageOption)}
                    </div>
                  </>
                ) : null}
                <div className="[font-family:var(--font-mono)] text-[0.62rem] font-semibold uppercase [letter-spacing:0.04em] text-[color:var(--chrome-fg-dim)] pt-[6px] px-[10px] pb-[2px]">
                  {t('dub.all_languages')}
                </div>
                <div
                  className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-[2px] px-[4px]"
                  data-testid="multi-lang-all-grid"
                >
                  {filteredLangs.slice(0, 50).map(renderLanguageOption)}
                </div>
                {filteredLangs.length > 50 ? (
                  <div className="px-[10px] py-[8px] text-[0.7rem] text-[color:var(--chrome-fg-dim)] text-center">
                    {t('dub.more_to_narrow', { count: filteredLangs.length - 50 })}
                  </div>
                ) : null}
                {filteredLangs.length === 0 && popularFiltered.length === 0 ? (
                  <div className="px-[10px] py-[8px] text-[0.7rem] text-[color:var(--chrome-fg-dim)] text-center">
                    {t('dub.no_matches')}
                  </div>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
