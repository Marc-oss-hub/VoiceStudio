import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AudioLines, ChevronDown, Search } from 'lucide-react';
import { createPortal } from 'react-dom';
import LanguageFlag from '../LanguageFlag';
import { LANG_CODES } from '../../utils/languages';

export default function PreviewTrackPicker({
  value,
  tracks,
  onChange,
  label,
  originalLabel,
  searchLabel,
  getTooltip,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [menuPos, setMenuPos] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const menuId = useId();

  const languageByCode = useMemo(
    () => new Map(LANG_CODES.map((language) => [language.code, language])),
    [],
  );
  const trackItems = useMemo(
    () =>
      tracks
        .map((code) => ({
          code,
          label: languageByCode.get(code)?.label || code.toUpperCase(),
        }))
        .filter((item) => {
          const normalizedQuery = query.toLowerCase().trim();
          return (
            !normalizedQuery ||
            item.label.toLowerCase().includes(normalizedQuery) ||
            item.code.toLowerCase().includes(normalizedQuery)
          );
        }),
    [languageByCode, query, tracks],
  );
  const activeLabel =
    value === 'original'
      ? originalLabel
      : languageByCode.get(value)?.label || value?.toUpperCase() || originalLabel;

  useEffect(() => {
    if (!open) return undefined;
    const onMouseDown = (event) => {
      if (!rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    const place = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const margin = 8;
      const gap = 4;
      const width = Math.min(Math.max(rect.width, 320), window.innerWidth - margin * 2);
      const left = Math.min(
        Math.max(margin, rect.left),
        Math.max(margin, window.innerWidth - width - margin),
      );
      const below = window.innerHeight - rect.bottom - gap - margin;
      const above = rect.top - gap - margin;
      const openUp = below < 240 && above > below;
      const maxHeight = Math.max(0, Math.min(300, openUp ? above : below));
      setMenuPos(
        openUp
          ? { bottom: window.innerHeight - rect.top + gap, left, width, maxHeight }
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
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const selectTrack = (code) => {
    onChange(code);
    setOpen(false);
    setQuery('');
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={rootRef}
      className="mb-[5px] flex items-center gap-[7px] rounded-[6px] border border-solid border-[var(--chrome-border)] bg-[var(--chrome-bg)] px-[8px] py-[5px]"
    >
      <span className="shrink-0 [font-family:var(--chrome-font-mono)] text-[0.6rem] font-semibold uppercase tracking-[var(--chrome-label-track)] text-[var(--chrome-fg-muted)]">
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        className="input-base !flex min-w-0 flex-1 items-center gap-[7px] !py-[3px] !text-left !text-[0.68rem] cursor-pointer"
        onClick={() => setOpen((current) => !current)}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
      >
        {value === 'original' ? (
          <AudioLines size={12} aria-hidden="true" />
        ) : (
          <LanguageFlag code={value} />
        )}
        <span className="min-w-0 flex-1 truncate">{activeLabel}</span>
        {value !== 'original' ? (
          <span className="[font-family:var(--font-mono)] text-[0.58rem] uppercase text-[var(--chrome-accent)]">
            {value}
          </span>
        ) : null}
        <ChevronDown size={11} aria-hidden="true" />
      </button>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              className="multi-lang__drop"
              role="dialog"
              aria-label={label}
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
                  placeholder={searchLabel}
                  aria-label={searchLabel}
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent border-0 text-[color:var(--chrome-fg)] [font-family:var(--font-sans)] text-[0.78rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chrome-accent)]"
                />
              </div>
              <div className="overflow-y-auto overscroll-contain p-[4px]">
                <button
                  type="button"
                  className={`mb-[2px] flex w-full items-center gap-[7px] rounded-[4px] px-[7px] py-[6px] border-0 text-left text-[0.76rem] cursor-pointer ${value === 'original' ? 'bg-[color-mix(in_srgb,var(--color-brand)_12%,transparent)] text-[var(--chrome-fg)]' : 'bg-transparent text-[var(--chrome-fg-muted)] hover:bg-[var(--chrome-hover-bg)]'}`}
                  onClick={() => selectTrack('original')}
                  aria-pressed={value === 'original'}
                >
                  <AudioLines size={12} aria-hidden="true" />
                  {originalLabel}
                </button>
                <div
                  className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-[2px]"
                  data-testid="preview-track-grid"
                >
                  {trackItems.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      className={`flex min-w-0 items-center gap-[7px] rounded-[4px] px-[7px] py-[6px] border-0 text-left text-[0.76rem] cursor-pointer ${value === item.code ? 'bg-[color-mix(in_srgb,var(--color-brand)_12%,transparent)] text-[var(--chrome-fg)]' : 'bg-transparent text-[var(--chrome-fg-muted)] hover:bg-[var(--chrome-hover-bg)]'}`}
                      onClick={() => selectTrack(item.code)}
                      title={getTooltip?.(item.code)}
                      aria-pressed={value === item.code}
                    >
                      <LanguageFlag code={item.code} />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      <span className="[font-family:var(--font-mono)] text-[0.58rem] uppercase text-[var(--chrome-fg-dim)]">
                        {item.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
