"use client";
import { forwardRef, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { COUNTRIES, COUNTRY_ALIASES, type Country } from "@/data/countries";
import { inputClass } from "@/components/forms/fields";
import { cn } from "@/lib/cn";
const normalise = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const INDEX = COUNTRIES.map(name => ({ name, keys: [name, ...(COUNTRY_ALIASES[name] ?? [])].map(normalise) }));
function search(query: string): Country[] {
  const q = normalise(query);
  if (!q) return [...COUNTRIES];
  const starts: Country[] = [], wordStarts: Country[] = [], contains: Country[] = [];
  for (const { name, keys } of INDEX) {
    if (keys.some(k => k.startsWith(q))) starts.push(name);
    else if (keys.some(k => k.split(/[\s(,-]+/).some(w => w.startsWith(q)))) wordStarts.push(name);
    else if (keys.some(k => k.includes(q))) contains.push(name);
  }
  return [...starts, ...wordStarts, ...contains];
}
type Props = { id: string; name: string; value: string; onChange: (value: string) => void; onBlur?: () => void; invalid?: boolean; required?: boolean; describedBy?: string; placeholder?: string };
export const CountryCombobox = forwardRef<HTMLInputElement, Props>(function CountryCombobox({ id, name, value, onChange, onBlur, invalid, required, describedBy, placeholder = "Search or select a country" }, ref) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => search(query), [query]);
  const scrollIntoView = (index: number) => listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  const openList = () => {
    if (open) return;
    setOpen(true); setQuery("");
    const idx = Math.max(0, value ? COUNTRIES.indexOf(value as Country) : 0);
    setActive(idx); requestAnimationFrame(() => scrollIntoView(idx));
  };
  const closeList = () => { setOpen(false); setQuery(""); };
  const choose = (country: string) => { onChange(country); closeList(); };
  const move = (delta: number) => {
    if (!open) return openList();
    if (!results.length) return;
    const next = Math.min(Math.max(active + delta, 0), results.length - 1);
    setActive(next); scrollIntoView(next);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); move(1); break;
      case "ArrowUp": e.preventDefault(); move(-1); break;
      case "Home": if (open && results.length) { e.preventDefault(); setActive(0); scrollIntoView(0); } break;
      case "End": if (open && results.length) { e.preventDefault(); setActive(results.length - 1); scrollIntoView(results.length - 1); } break;
      case "Enter": if (open) { e.preventDefault(); if (results[active]) choose(results[active]); } break;
      case "Escape": if (open) { e.preventDefault(); e.stopPropagation(); closeList(); } break;
      case "Tab": if (open && query && results.length === 1) choose(results[0]); else closeList(); break;
    }
  };
  const handleBlur = (e: React.FocusEvent) => {
    if (wrapRef.current?.contains(e.relatedTarget as Node | null)) return;
    if (open && query) {
      const exact = INDEX.find(item => item.keys.includes(normalise(query)));
      if (exact) onChange(exact.name);
    }
    closeList(); onBlur?.();
  };
  return <div ref={wrapRef} className="relative" onBlur={handleBlur}>
    <div className="relative"><Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
      <input ref={ref} id={id} type="text" role="combobox" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="done" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={open && results[active] ? `${listId}-opt-${active}` : undefined} aria-invalid={invalid || undefined} aria-required={required || undefined} aria-describedby={describedBy} placeholder={placeholder} value={open ? query : value} onChange={e => { if (!open) setOpen(true); if (value) onChange(""); setQuery(e.target.value); setActive(0); listRef.current?.scrollTo({ top: 0 }); }} onClick={openList} onKeyDown={onKeyDown} className={cn(inputClass(invalid), "h-12 pl-10 pr-10")} />
      <button type="button" tabIndex={-1} aria-label={open ? "Close country list" : "Open country list"} onMouseDown={e => e.preventDefault()} onClick={() => { wrapRef.current?.querySelector<HTMLInputElement>("input[role=combobox]")?.focus(); if (open) closeList(); else openList(); }} className="absolute right-1 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center text-ink-500"><ChevronDown aria-hidden className={cn("size-4 transition-transform", open && "rotate-180")} /></button>
    </div>
    <input type="hidden" name={name} value={value} />
    <ul ref={listRef} id={listId} role="listbox" aria-label="Countries" hidden={!open} className="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto overscroll-contain rounded-md border border-ink-200 bg-white py-1 shadow-lg">
      {!results.length && <li role="presentation" className="px-4 py-3 text-sm text-ink-500">No country matches “{query}”.</li>}
      {results.map((country, i) => <li key={country} id={`${listId}-opt-${i}`} data-index={i} role="option" aria-selected={country === value} onMouseDown={e => e.preventDefault()} onClick={() => choose(country)} onMouseMove={() => active !== i && setActive(i)} className={cn("flex min-h-10 cursor-pointer items-center justify-between gap-3 px-4 py-2 text-[0.9375rem]", i === active ? "bg-sand-100 text-ink-950" : "text-ink-800")}>{country}{country === value && <Check aria-hidden className="size-4 shrink-0 text-brand-600" />}</li>)}
    </ul>
  </div>;
});
