"use client";
import { FileText, X } from "lucide-react";
import { BrochureForm } from "@/components/forms/BrochureForm";
export default function BrochureDialogContent({ onClose }: { onClose: () => void }) {
  return <div className="bg-white">
    <header className="sticky top-0 z-40 flex items-start justify-between gap-4 border-b border-sand-200 bg-white px-5 py-5 sm:px-8">
      <div className="flex items-start gap-4"><span className="hidden size-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 sm:inline-flex"><FileText aria-hidden className="size-6" /></span><div><h2 className="text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">Request the expo brochure</h2><p className="mt-1 text-sm leading-relaxed text-ink-600">Complete your details to receive the expo brochure.</p></div></div>
      <button type="button" onClick={onClose} aria-label="Close brochure form" className="-mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-sand-100 hover:text-ink-900"><X aria-hidden className="size-5" /></button>
    </header>
    <div className="px-5 py-6 sm:px-8 sm:py-8"><BrochureForm compact /></div>
  </div>;
}
