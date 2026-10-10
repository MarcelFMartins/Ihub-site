"use client";

import { useEffect } from "react";

/** Popup de confirmação do painel (substitui o confirm() do navegador). */
export default function ConfirmDialog({
  title,
  children,
  confirmLabel,
  danger,
  busy,
  onConfirm,
  onCancel,
}: {
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="adm__overlay inv__overlay adm__overlay--top" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="adm__modal adm__modal--sm adm__confirm" role="alertdialog" aria-modal="true" aria-label={title}>
        <div className="adm__confirmbody">
          <span className={`adm__confirmicon ${danger ? "is-danger" : ""}`} aria-hidden>
            {danger ? "!" : "?"}
          </span>
          <h2>{title}</h2>
          <div className="adm__muted">{children}</div>
        </div>
        <footer className="inv__actions">
          <button className={`adm__btn ${danger ? "adm__btn--solid-danger" : ""}`} onClick={onConfirm} disabled={busy} autoFocus>
            {busy ? "Aguarde…" : confirmLabel}
          </button>
          <button className="adm__btn adm__btn--ghost" onClick={onCancel}>
            Cancelar
          </button>
        </footer>
      </div>
    </div>
  );
}
