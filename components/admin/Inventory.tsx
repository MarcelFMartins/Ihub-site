"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { CONDITIONS, type Condition, type Status, type StockItem } from "@/lib/data";
import { brl, removeItem, setStatus, usePrivate } from "@/lib/adminDb";
import { useStock } from "@/lib/stock";
import Logo from "../Logo";
import ItemForm from "./ItemForm";

type Tab = "estoque" | "reservado" | "vendido" | "todos";
const TABS: { id: Tab; label: string }[] = [
  { id: "estoque", label: "Disponíveis" },
  { id: "reservado", label: "Reservados" },
  { id: "vendido", label: "Vendidos" },
  { id: "todos", label: "Todos" },
];
const statusOf = (s: StockItem): Status => s.status ?? "disponivel";
const STATUS_LABEL: Record<Status, string> = { disponivel: "Disponível", reservado: "Reservado", vendido: "Vendido" };

export default function Inventory({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const { items, loading } = useStock({ includeSold: true });
  const priv = usePrivate();
  const [tab, setTab] = useState<Tab>("estoque");
  const [cond, setCond] = useState<"" | Condition>("");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<StockItem | "new" | null>(null);
  const [selling, setSelling] = useState<StockItem | null>(null);
  const [sellPrice, setSellPrice] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const stats = useMemo(() => {
    const live = items.filter((i) => statusOf(i) !== "vendido");
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const soldMonth = items.filter((i) => statusOf(i) === "vendido" && (priv[i.id!]?.soldAt ?? 0) >= monthStart.getTime());
    return {
      available: items.filter((i) => statusOf(i) === "disponivel").length,
      reserved: items.filter((i) => statusOf(i) === "reservado").length,
      soldMonth: soldMonth.length,
      cost: live.reduce((a, i) => a + (priv[i.id!]?.cost ?? 0), 0),
      value: live.reduce((a, i) => a + (priv[i.id!]?.price ?? 0), 0),
      profit: soldMonth.reduce((a, i) => a + ((priv[i.id!]?.soldPrice ?? 0) - (priv[i.id!]?.cost ?? 0)), 0),
    };
  }, [items, priv]);

  const rows = items.filter((i) => {
    const st = statusOf(i);
    if (tab === "estoque" && st !== "disponivel") return false;
    if (tab === "reservado" && st !== "reservado") return false;
    if (tab === "vendido" && st !== "vendido") return false;
    if (cond && i.condition !== cond) return false;
    const hay = `${i.model} ${i.color} ${i.storage} ${priv[i.id!]?.imei ?? ""}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });
  const count = (t: Tab) => items.filter((i) => (t === "todos" ? true : t === "estoque" ? statusOf(i) === "disponivel" : statusOf(i) === t)).length;

  const run = async (fn: () => Promise<void>, ok: string) => {
    try {
      await fn();
      setToast(ok);
    } catch {
      setToast("Não foi possível concluir a ação. Tente novamente.");
    }
  };

  const confirmSale = () => {
    const s = selling!;
    const v = sellPrice.trim() === "" ? undefined : Number(sellPrice.replace(",", "."));
    setSelling(null);
    run(() => setStatus(s.id!, "vendido", v), "Venda registrada.");
  };

  return (
    <main className="adm">
      <header className="adm__bar">
        <div className="adm__brand">
          <Logo className="adm__logo" ink="#0B1533" sub={false} badge={false} />
          <span>Estoque</span>
        </div>
        <div className="adm__who">
          <span>{user.email}</span>
          <Link href="/catalogo" target="_blank">
            Ver catálogo
          </Link>
          <button onClick={onSignOut}>Sair</button>
        </div>
      </header>

      <section className="adm__stats">
        <div>
          <span>Disponíveis</span>
          <strong>{stats.available}</strong>
        </div>
        <div>
          <span>Reservados</span>
          <strong>{stats.reserved}</strong>
        </div>
        <div>
          <span>Vendidos no mês</span>
          <strong>{stats.soldMonth}</strong>
          <small>Lucro {brl(stats.profit)}</small>
        </div>
        <div>
          <span>Valor em estoque</span>
          <strong>{brl(stats.value)}</strong>
          <small>Custo {brl(stats.cost)}</small>
        </div>
      </section>

      <section className="adm__panel">
        <div className="adm__toolbar">
          <div className="adm__tabs" role="tablist">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "is-active" : ""} onClick={() => setTab(t.id)}>
                {t.label} <span>{count(t.id)}</span>
              </button>
            ))}
          </div>
          <div className="adm__tools">
            <input type="search" placeholder="Buscar modelo, cor ou IMEI" value={q} onChange={(e) => setQ(e.target.value)} />
            <select value={cond} onChange={(e) => setCond(e.target.value as "" | Condition)} aria-label="Condição">
              <option value="">Todas as condições</option>
              {CONDITIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <button className="adm__btn" onClick={() => setEditing("new")}>
              + Adicionar
            </button>
          </div>
        </div>

        {loading ? (
          <p className="adm__empty">Carregando…</p>
        ) : rows.length === 0 ? (
          <p className="adm__empty">{items.length === 0 ? "Nenhum aparelho cadastrado ainda. Clique em “+ Adicionar”." : "Nenhum aparelho encontrado com esses filtros."}</p>
        ) : (
          <div className="adm__table" role="table">
            <div className="adm__thead" role="row">
              <span>Aparelho</span>
              <span>IMEI</span>
              <span>Condição</span>
              <span>Custo</span>
              <span>Preço</span>
              <span>Situação</span>
              <span />
            </div>
            {rows.map((i) => {
              const p = priv[i.id!] ?? {};
              const st = statusOf(i);
              return (
                <div className={`adm__tr ${st === "vendido" ? "is-sold" : ""}`} role="row" key={i.id}>
                  <div className="adm__dev">
                    <div className="adm__thumb">
                      <Image src={i.img} alt="" fill sizes="56px" unoptimized />
                    </div>
                    <div>
                      <strong>{i.model}</strong>
                      <small>
                        {i.storage} · {i.color}
                        {i.battery ? ` · ${i.battery}%` : ""}
                      </small>
                    </div>
                  </div>
                  <span data-l="IMEI" className="adm__mono">{p.imei || "—"}</span>
                  <span data-l="Condição">
                    <i className={`adm__pill adm__pill--${i.condition}`}>{CONDITIONS.find((c) => c.id === i.condition)?.label}</i>
                  </span>
                  <span data-l="Custo">{brl(p.cost)}</span>
                  <span data-l="Preço">
                    {st === "vendido" ? brl(p.soldPrice ?? p.price) : brl(p.price)}
                    {st === "vendido" && p.soldAt && <small>{new Date(p.soldAt).toLocaleDateString("pt-BR")}</small>}
                  </span>
                  <span data-l="Situação">
                    <select
                      className={`adm__status adm__status--${st}`}
                      value={st}
                      onChange={(e) => {
                        const v = e.target.value as Status;
                        if (v === "vendido") {
                          setSelling(i);
                          setSellPrice(p.price != null ? String(p.price) : "");
                        } else run(() => setStatus(i.id!, v), "Situação atualizada.");
                      }}
                    >
                      {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </span>
                  <span className="adm__actions">
                    <button onClick={() => setEditing(i)}>Editar</button>
                    <button
                      className="is-danger"
                      onClick={() => confirm(`Excluir "${i.model} ${i.color}" definitivamente? Isso apaga também o histórico dele.`) && run(() => removeItem(i.id!), "Aparelho excluído.")}
                    >
                      Excluir
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {editing && (
        <ItemForm
          item={editing === "new" ? undefined : editing}
          priv={editing === "new" ? undefined : priv[editing.id!]}
          onClose={() => setEditing(null)}
          onSaved={(m) => {
            setEditing(null);
            setToast(m);
          }}
        />
      )}

      {selling && (
        <div className="adm__overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelling(null)}>
          <form
            className="adm__modal adm__modal--sm"
            onSubmit={(e) => {
              e.preventDefault();
              confirmSale();
            }}
          >
            <header>
              <h2>Registrar venda</h2>
              <button type="button" className="adm__x" onClick={() => setSelling(null)} aria-label="Fechar">
                ×
              </button>
            </header>
            <div className="adm__modalbody adm__modalbody--col">
              <p>
                <strong>{selling.model}</strong> · {selling.storage} · {selling.color}
              </p>
              <label className="adm__field">
                Valor da venda (R$)
                <input type="number" min={0} step="0.01" autoFocus value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
              </label>
              <p className="adm__muted">O aparelho sai do catálogo e fica no histórico em “Vendidos”.</p>
            </div>
            <footer>
              <button type="button" className="adm__btn adm__btn--ghost" onClick={() => setSelling(null)}>
                Cancelar
              </button>
              <button className="adm__btn">Confirmar venda</button>
            </footer>
          </form>
        </div>
      )}

      {toast && <div className="adm__toast" role="status">{toast}</div>}
    </main>
  );
}
