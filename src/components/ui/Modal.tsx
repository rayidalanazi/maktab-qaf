"use client";

import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  sub?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

/**
 * Generic centered modal dialog. Used across the admin panel for control
 * actions (grant feature, confirm suspend, edit, etc).
 */
export function Modal({ open, onClose, title, sub, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg";

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className={`w-full ${maxW} max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elev)] shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || sub) && (
          <div className="p-5 border-b border-[var(--border)] flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title && <h3 className="font-display font-bold text-lg leading-tight">{title}</h3>}
              {sub && <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg grid place-items-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)] shrink-0"
              aria-label="إغلاق"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
        {footer && (
          <div className="p-4 border-t border-[var(--border)] flex flex-wrap items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
