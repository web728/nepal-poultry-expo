"use client";

import { forwardRef, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { COUNTRIES, COUNTRY_ALIASES, type Country } from "@/data/countries";
import { inputClass } from "@/components/forms/fields";
import { cn } from "@/lib/cn";

const normalise = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

const INDEX = COUNTRIES.map((name) => ({
  name,
  keys: [name, ...(COUNTRY_ALIASES[name] ?? [])].map(normalise),
}));

function search(query: string): Country[] {
  const q = normalise(query);
  if (!q) return [...COUNTRIES];
  const starts: Country[] = [];
  const wordStarts: Country[] = [];
  const contains: Country[] = [];
  for (const { name, keys } of INDEX) {
    if (keys.some((k) => k.startsWith(q))) starts.push(name);
    else if (keys.some((k) => k.split(/[\s(,-]+/).some((w) => w.startsWith(q)))) wordStarts.push(name);
    else if (keys.some((k) => k.includes(q))) contains.push(name);
  }
  return [...starts, ...wordStarts, ...contains];
}

type Props = {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  required?: boolean;
  describedBy?: string;
  placeholder?: string;
};

/**
 * Searchable country picker following the WAI-ARIA combobox pattern:
 * type to filter (diacritics and common aliases understood), ↑/↓ to move,
 * Enter to choose, Esc to close. Works with touch keyboards on mobile.
 */
export const CountryCombobox = forwardRef<HTMLInputElement, Props>(function CountryCombobox(
  { id, name, value, onChange, onBlur, invalid, required, describedBy, placeholder = "Search or select a country" },
  ref,
) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => search(query), [query]);

  const scrollIntoView = (index: number) => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    el?.scrollIntoView({ block: "nearest" });
  };

  const openList = () => {
    if (open) return;
    setOpen(true);
    setQuery("");
    const idx = Math.max(0, value ? COUNTRIES.indexOf(value as Country) : 0);
    setActive(idx);
    requestAnimationFrame(() => scrollIntoView(idx));
  };

  const choose = (country: string) => {
    onChange(country);
    setOpen(false);
    setQuery("");
  };

  const move = (delta: number) => {
    if (!open) return openList();
    const next = Math.min(Math.max(active + delta, 0), results.length - 1);
    setActive(next);
    scrollIntoView(next);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(-1);
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
          scrollIntoView(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(results.length - 1);
          scrollIntoView(results.length - 1);
        }
        break;
      case "Enter":
        if (open) {
          e.preventDefault();
          if (results[active]) choose(results[active]);
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
          setQuery("");
        }
        break;
      case "Tab":
        if (open && query && results.length === 1) choose(results[0]);
        else setOpen(false);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (wrapRef.current?.contains(e.relatedTarget as Node | null)) return;
    if (open && query) {
      const exact = results.find((c) => normalise(c) === normalise(query));
      if (exact) onChange(exact);
    }
    setOpen(false);
    setQuery("");
    onBlur?.();
  };

  const activeId = open && results[active] ? `${listId}-opt-${active}` : undefined;

  return (
    <div ref={wrapRef} className="relative" onBlur={handleBlur}>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
        <input
          ref={ref}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          placeholder={placeholder}
          value={open ? query : value}
          onChange={(e) => {
            if (!open) setOpen(true);
            setQuery(e.target.value);
            setActive(0);
            listRef.current?.scrollTo({ top: 0 });
          }}
          onClick={openList}
          onKeyDown={onKeyDown}
          className={cn(inputClass(invalid), "h-12 pl-10 pr-10", !open && !value && "placeholder:text-ink-400")}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? "Close country list" : "Open country list"}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => (open ? setOpen(false) : openList())}
          className="absolute right-1 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center text-ink-500"
        >
          <ChevronDown aria-hidden className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {/* Keeps the chosen value in native form data as well. */}
      <input type="hidden" name={name} value={value} />

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label="Countries"
        hidden={!open}
        className="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto overscroll-contain border border-ink-200 bg-white py-1 shadow-[0_16px_32px_-16px_rgba(13,26,43,0.35)]"
      >
        {results.length === 0 && <li className="px-4 py-3 text-sm text-ink-500">No country matches “{query}”.</li>}
        {results.map((country, i) => {
          const selected = country === value;
          return (
            <li
              key={country}
              id={`${listId}-opt-${i}`}
              data-index={i}
              role="option"
              aria-selected={selected}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(country)}
              onMouseMove={() => active !== i && setActive(i)}
              className={cn(
                "flex min-h-10 cursor-pointer items-center justify-between gap-3 px-4 py-2 text-[0.9375rem]",
                i === active ? "bg-sand-100 text-ink-950" : "text-ink-800",
              )}
            >
              {country}
              {selected && <Check aria-hidden className="size-4 shrink-0 text-brand-600" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
});
