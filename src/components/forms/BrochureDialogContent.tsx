"use client";

import { m } from "framer-motion";
import { FileText, X } from "lucide-react";
import { MotionScope } from "@/components/motion/MotionScope";
import { BrochureForm } from "@/components/forms/BrochureForm";

/** Contents of the brochure dialog — loaded only when the dialog is first opened. */
export default function BrochureDialogContent({ onClose }: { onClose: () => void }) {
  return (
    <MotionScope>
      <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
        <div className="flex items-start justify-between gap-4 border-b border-sand-200 bg-white px-6 py-5 sm:px-8">
          <div className="flex gap-4">
            <span className="hidden size-11 shrink-0 items-center justify-center bg-brand-50 text-brand-700 sm:inline-flex">
              <FileText aria-hidden className="size-5" />
            </span>
            <div>
              <h2 id="brochure-dialog-title" className="text-2xl">
                Request the expo brochure
              </h2>
              <p className="mt-1 text-sm text-ink-600">Tell us who you are and we&apos;ll send it straight away.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 inline-flex size-10 shrink-0 items-center justify-center text-ink-500 hover:text-ink-900"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <div className="px-6 py-6 sm:px-8">
          <BrochureForm compact />
        </div>
      </m.div>
    </MotionScope>
  );
}
