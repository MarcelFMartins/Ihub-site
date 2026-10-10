"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { CONDITIONS, type Condition, type Status, type StockItem } from "@/lib/data";
import { brl, brlShort, removeItem, setStatus, usePrivate } from "@/lib/adminDb";
import { useStock } from "@/lib/stock";
import Logo from "../Logo";
import ItemForm from "./ItemForm";

type Tab = "estoque" | "disponivel" | "reservado" | "vendido";
const TABS: { id: Tab; label: string; short: string }[] = [
  { id: "estoque", label: "Em estoque", short: "Estoque" },
  { id: "disponivel", label: "Disponíveis", short: "À venda" },
  { id: "reservado", label: "Reservados", short: "Reserv." },
  { id: "vendido", label: "Vendidos", short: "Vendidos" },
];
type Period = "mes" | "30d" | "ano" | "tudo";
const PERIODS: { id: Period; label: string }[] = [
  { id: "mes", label: "Este mês" },
  { id: "30d", label: "30 dias" },
  { id: "ano", label: "Este ano" },
  { id: "tudo", label: "Tudo" },
];
type Sort = "recentes" | "preco-desc" | "preco-asc" | "modelo";

const statusOf = (s: StockItem): Status => s.status ?? "disponivel";
const STATUS_LABEL: Record<Status, string> = { disponivel: "Disponível", reservado: "Reservado", vendido: "Vendido" };
const condLabel = (c: Condition) => CONDITIONS.find((x) => x.id === c)?.label ?? c;

function periodStart(p: Period) {
  const d = new Date();
  if (p === "tudo") return 0;
  if (p === "30d") return Date.now() - 30 * 864e5;
  if (p === "ano") return new Date(d.getFullYear(), 0, 1).getTime();
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

export default function Inventory({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const { items, loading } = useStock({ includeSold: true });
  const { map: priv, denied } = usePrivate();
  const [tab, setTab] = useState<Tab>("estoque");
  const [period, setPeriod] = useState<Period>("mes");
  const [cond, setCond] = useState<"" | Condition>("");
  const [sort, setSort] = useState<Sort>("recentes");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<StockItem | null>(null);
  const [editing, setEditing] = useState<StockItem | "new" | null>(null);
  const [selling, setSelling] = useState<StockItem | null>(null);
  const [sellPrice, setSellPrice] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const p = (i: StockItem) => priv[i.id!] ?? {};

  const stats = useMemo(() => {
    const live = items.filter((i) => statusOf(i) !== "vendido");
    const from = periodStart(period);
    const sold = items.filter((i) => statusOf(i) === "vendido" && (p(i).soldAt ?? 0) >= from);
    const revenue = sold.reduce((a, i) => a + (p(i).soldPrice ?? p(i).price ?? 0), 0);
    const profit = sold.reduce((a, i) => a + ((p(i).soldPrice ?? p(i).price ?? 0) - (p(i).cost ?? 0)), 0);
    return {
      live: live.length,
      reserved: live.filter((i) => statusOf(i) === "reservado").length,
      value: live.reduce((a, i) => a + (p(i).price ?? 0), 0),
      cost: live.reduce((a, i) => a + (p(i).cost ?? 0), 0),
      sold: sold.length,
      revenue,
      profit,
      margin: revenue ? Math.round((profit / revenue) * 100) : 0,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, priv, period]);

  const inTab = (i: StockItem, t: Tab) => (t === "estoque" ? statusOf(i) !== "vendido" : statusOf(i) === t);
  const rows = items
    .filter((i) => {
      if (!inTab(i, tab)) return false;
      if (cond && i.condition !== cond) return false;
      return `${i.model} ${i.color} ${i.storage} ${p(i).imei ?? ""}`.toLowerCase().includes(q.trim().toLowerCase());
    })
    .sort((a, b) => {
      if (sort === "modelo") return a.model.localeCompare(b.model, "pt-BR", { numeric: true });
      if (sort === "preco-desc") return (p(b).price ?? 0) - (p(a).price ?? 0);
      if (sort === "preco-asc") return (p(a).price ?? 0) - (p(b).price ?? 0);
      return 0;
    });

  const run = async (fn: () => Promise<void>, ok: string) => {
    try {
      await fn();
      setToast(ok);
    } catch {
      setToast("Não foi possível concluir. Tente novamente.");
    }
  };

  const startSale = (i: StockItem) => {
    setOpen(null);
    setSelling(i);
    setSellPrice(p(i).price != null ? String(p(i).price) : "");
  };
  const confirmSale = () => {
    const s = selling!;
    const v = sellPrice.trim() === "" ? undefined : Number(sellPrice.replace(",", "."));
    setSelling(null);
    run(() => setStatus(s.id!, "vendido", v), "Venda registrada.");
  };

  return (
    <main className="adm inv">
      <header className="inv__bar">
        <Logo className="adm__logo" ink="#0B1533" sub={false} badge={false} />
        <nav>
          <Link href="/catalogo" target="_blank">
            Ver site
          </Link>
          <button onClick={onSignOut} title={user.email ?? ""}>
            Sair
          </button>
        </nav>
      </header>

      {denied && (
        <div className="adm__alert" role="alert">
          <strong>Sem permissão no Firebase.</strong> O e-mail <b>{user.email}</b> não está liberado nas regras do Firestore. Abra Firestore → Regras, cole o
          conteúdo de <code>firestore.rules</code> com este e-mail e publique.
        </div>
      )}

      <section className="inv__summary">
        <div className="inv__summaryhead">
          <h1>Resumo</h1>
          <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} aria-label="Período">
            {PERIODS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </div>
        <div className="inv__stats">
          <Stat label="Em estoque" value={String(stats.live)} sub={stats.reserved ? `${stats.reserved} reservado${stats.reserved > 1 ? "s" : ""}` : "aparelhos"} />
          <Stat label="Valor do estoque" value={brlShort(stats.value)} title={brl(stats.value)} sub={`custo ${brlShort(stats.cost)}`} />
          <Stat label="Vendas" value={String(stats.sold)} sub={`faturou ${brlShort(stats.revenue)}`} />
          <Stat label="Lucro" value={brlShort(stats.profit)} title={brl(stats.profit)} sub={stats.revenue ? `margem ${stats.margin}%` : "sem vendas"} tone={stats.profit < 0 ? "neg" : "pos"} />
        </div>
      </section>

      <section className="inv__list">
        <div className="inv__tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "is-active" : ""} onClick={() => setTab(t.id)}>
              <em>{t.label}</em>
              <em className="inv__short">{t.short}</em>
              <span>{items.filter((i) => inTab(i, t.id)).length}</span>
            </button>
          ))}
        </div>

        <div className="inv__filters">
          <input type="search" placeholder="Buscar modelo, cor ou IMEI" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={cond} onChange={(e) => setCond(e.target.value as "" | Condition)} aria-label="Condição">
            <option value="">Todas</option>
            {CONDITIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Ordenar">
            <option value="recentes">Recentes</option>
            <option value="preco-desc">Maior preço</option>
            <option value="preco-asc">Menor preço</option>
            <option value="modelo">Modelo (A–Z)</option>
          </select>
        </div>

        {loading ? (
          <p className="adm__empty">Carregando…</p>
        ) : rows.length === 0 ? (
          <p className="adm__empty">{items.length === 0 ? "Nenhum aparelho ainda. Toque em “Adicionar”." : "Nada encontrado com esses filtros."}</p>
        ) : (
          <ul className="inv__rows">
            {rows.map((i) => {
              const st = statusOf(i);
              const price = st === "vendido" ? p(i).soldPrice ?? p(i).price : p(i).price;
              return (
                <li key={i.id}>
                  <button className="inv__row" onClick={() => setOpen(i)}>
                    <span className="inv__thumb">
                      <Image src={i.img} alt="" fill sizes="52px" unoptimized />
                    </span>
                    <span className="inv__name">
                      <strong>
                        {i.featured && <span className="inv__star" title="Destaque">★ </span>}
                        {i.model}
                      </strong>
                      <small>
                        {i.storage} · {i.color} · {condLabel(i.condition)}
                        {i.battery ? ` · ${i.battery}%` : ""}
                      </small>
                    </span>
                    <span className="inv__right">
                      <b>{brl(price)}</b>
                      <i className={`inv__chip inv__chip--${st}`}>{STATUS_LABEL[st]}</i>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <button className="inv__fab" onClick={() => setEditing("new")}>
        <span aria-hidden>+</span> Adicionar
      </button>

      {open && (
        <div className="adm__overlay inv__overlay" onMouseDown={(e) => e.target === e.currentTarget && setOpen(null)}>
          <div className="adm__modal inv__sheet" role="dialog" aria-label={open.model}>
            <header>
              <h2>{open.model}</h2>
              <button className="adm__x" onClick={() => setOpen(null)} aria-label="Fechar">
                ×
              </button>
            </header>
            <div className="inv__detail">
              <div className="inv__dimg">
                <Image src={open.img} alt="" fill sizes="160px" unoptimized />
              </div>
              <dl>
                <dt>Situação</dt>
                <dd>
                  <i className={`inv__chip inv__chip--${statusOf(open)}`}>{STATUS_LABEL[statusOf(open)]}</i>
                </dd>
                <dt>Aparelho</dt>
                <dd>
                  {open.storage} · {open.color}
                </dd>
                <dt>Condição</dt>
                <dd>
                  {condLabel(open.condition)}
                  {open.battery ? ` · bateria ${open.battery}%` : ""}
                </dd>
                {(open.featured || open.badge) && (
                  <>
                    <dt>Vitrine</dt>
                    <dd>{[open.featured && "Destaque", open.badge].filter(Boolean).join(" · ")}</dd>
                  </>
                )}
                <dt>Fotos</dt>
                <dd>{open.imgs?.length ?? 1}</dd>
                <dt>IMEI</dt>
                <dd>{p(open).imei || "—"}</dd>
                <dt>Custo</dt>
                <dd>{brl(p(open).cost)}</dd>
                <dt>Preço</dt>
                <dd>{brl(p(open).price)}</dd>
                {statusOf(open) === "vendido" && (
                  <>
                    <dt>Vendido por</dt>
                    <dd>
                      {brl(p(open).soldPrice)}
                      {p(open).soldAt ? ` em ${new Date(p(open).soldAt!).toLocaleDateString("pt-BR")}` : ""}
                    </dd>
                  </>
                )}
                {open.note && (
                  <>
                    <dt>Observação</dt>
                    <dd>{open.note}</dd>
                  </>
                )}
                {p(open).internalNote && (
                  <>
                    <dt>Interno</dt>
                    <dd>{p(open).internalNote}</dd>
                  </>
                )}
              </dl>
            </div>
            <footer className="inv__actions">
              {statusOf(open) !== "vendido" && (
                <button className="adm__btn" onClick={() => startSale(open)}>
                  Registrar venda
                </button>
              )}
              {statusOf(open) === "disponivel" && (
                <button className="adm__btn adm__btn--ghost" onClick={() => (setOpen(null), run(() => setStatus(open.id!, "reservado"), "Marcado como reservado."))}>
                  Reservar
                </button>
              )}
              {statusOf(open) !== "disponivel" && (
                <button className="adm__btn adm__btn--ghost" onClick={() => (setOpen(null), run(() => setStatus(open.id!, "disponivel"), "Voltou para disponível."))}>
                  {statusOf(open) === "vendido" ? "Desfazer venda" : "Liberar reserva"}
                </button>
              )}
              <button className="adm__btn adm__btn--ghost" onClick={() => (setEditing(open), setOpen(null))}>
                Editar
              </button>
              <button
                className="adm__btn adm__btn--danger"
                onClick={() => {
                  if (!confirm(`Excluir "${open.model} ${open.color}" definitivamente?`)) return;
                  setOpen(null);
                  run(() => removeItem(open.id!), "Aparelho excluído.");
                }}
              >
                Excluir
              </button>
            </footer>
          </div>
        </div>
      )}

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
        <div className="adm__overlay inv__overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelling(null)}>
          <form
            className="adm__modal inv__sheet"
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
              <label>
                Valor da venda (R$)
                <input type="number" inputMode="decimal" min={0} step="0.01" autoFocus value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
              </label>
              <p className="adm__muted">O aparelho sai do catálogo e vai para “Vendidos”.</p>
            </div>
            <footer className="inv__actions">
              <button className="adm__btn">Confirmar venda</button>
              <button type="button" className="adm__btn adm__btn--ghost" onClick={() => setSelling(null)}>
                Cancelar
              </button>
            </footer>
          </form>
        </div>
      )}

      {toast && (
        <div className="adm__toast" role="status">
          {toast}
        </div>
      )}
    </main>
  );
}

function Stat({ label, value, sub, title, tone }: { label: string; value: string; sub: string; title?: string; tone?: "pos" | "neg" }) {
  return (
    <div className="inv__stat" title={title}>
      <span>{label}</span>
      <strong className={tone === "neg" ? "is-neg" : ""}>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}
