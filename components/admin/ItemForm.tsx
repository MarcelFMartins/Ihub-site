"use client";

import { useState } from "react";
import { CONDITIONS, type Condition, type Status, type StockItem } from "@/lib/data";
import { photoToDataUrl, saveItem, type Private } from "@/lib/adminDb";

const MODELS = [
  "iPhone 11 Pro Max", "iPhone 12 Pro Max", "iPhone 13 Pro Max", "iPhone 14 Pro Max", "iPhone 15 Pro Max", "iPhone 16 Pro Max",
  "iPhone 17", "iPhone 17 Pro", "iPhone 17 Pro Max", "iPhone 18 Pro", "iPhone 18 Pro Max",
];
const STORAGES = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];
const num = (v: string) => (v.trim() === "" ? undefined : Number(v.replace(",", ".")));
const str = (n?: number) => (n == null ? "" : String(n));

export default function ItemForm({ item, priv, onClose, onSaved }: { item?: StockItem; priv?: Private; onClose: () => void; onSaved: (msg: string) => void }) {
  const [model, setModel] = useState(item?.model ?? "");
  const [storage, setStorage] = useState(item?.storage ?? "256 GB");
  const [color, setColor] = useState(item?.color ?? "");
  const [condition, setCondition] = useState<Condition>(item?.condition ?? "lacrado");
  const [status, setStatus] = useState<Status>(item?.status === "reservado" ? "reservado" : "disponivel");
  const [battery, setBattery] = useState(str(item?.battery));
  const [note, setNote] = useState(item?.note ?? "");
  const [photo, setPhoto] = useState(item?.img ?? "");
  const [imei, setImei] = useState(priv?.imei ?? "");
  const [cost, setCost] = useState(str(priv?.cost));
  const [price, setPrice] = useState(str(priv?.price));
  const [internal, setInternal] = useState(priv?.internalNote ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pick = async (f?: File) => {
    if (!f) return;
    try {
      setPhoto(await photoToDataUrl(f));
    } catch {
      setErr("Não consegui ler essa foto. Tente outra.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return setErr("Escolha uma foto do aparelho.");
    setBusy(true);
    setErr("");
    try {
      await saveItem(
        item?.id ?? null,
        { model: model.trim(), storage, color: color.trim(), condition, status, img: photo, battery: condition !== "lacrado" ? num(battery) : undefined, note: note.trim() || undefined },
        { imei: imei.trim() || undefined, cost: num(cost), price: num(price), internalNote: internal.trim() || undefined }
      );
      onSaved(item ? "Alterações salvas." : "Aparelho adicionado ao estoque.");
    } catch (e) {
      const denied = ((e as { code?: string })?.code ?? "").includes("permission");
      setErr(denied ? "Sem permissão. Este e-mail não está autorizado nas regras do Firebase." : "Não foi possível salvar. Tente novamente.");
      setBusy(false);
    }
  };

  return (
    <div className="adm__overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="adm__modal" onSubmit={submit}>
        <header>
          <h2>{item ? "Editar aparelho" : "Adicionar aparelho"}</h2>
          <button type="button" className="adm__x" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="adm__modalbody">
          <div className="adm__photo">
            <div className="adm__photobox">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="Pré-visualização" />
              ) : (
                <span>Sem foto</span>
              )}
            </div>
            <label className="adm__btn adm__btn--ghost">
              {photo ? "Trocar foto" : "Escolher foto"}
              <input type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
            </label>
          </div>

          <div className="adm__fields">
            <fieldset>
              <legend>Aparece no site</legend>
              <label>
                Modelo
                <input required list="adm-models" placeholder="iPhone 17 Pro Max" value={model} onChange={(e) => setModel(e.target.value)} />
                <datalist id="adm-models">
                  {MODELS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </label>
              <div className="adm__row">
                <label>
                  Capacidade
                  <select value={storage} onChange={(e) => setStorage(e.target.value)}>
                    {STORAGES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Cor
                  <input required placeholder="Laranja Cósmico" value={color} onChange={(e) => setColor(e.target.value)} />
                </label>
              </div>
              <div className="adm__row">
                <label>
                  Condição
                  <select value={condition} onChange={(e) => setCondition(e.target.value as Condition)}>
                    {CONDITIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
                {condition !== "lacrado" && (
                  <label>
                    Bateria (%)
                    <input type="number" min={1} max={100} placeholder="90" value={battery} onChange={(e) => setBattery(e.target.value)} />
                  </label>
                )}
                <label>
                  Situação
                  <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                    <option value="disponivel">Disponível</option>
                    <option value="reservado">Reservado</option>
                  </select>
                </label>
              </div>
              <label>
                Observação
                <input placeholder="Ex.: marcas leves na lateral" value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
            </fieldset>

            <fieldset>
              <legend>Controle interno — não aparece no site</legend>
              <label>
                IMEI / nº de série
                <input inputMode="numeric" placeholder="Opcional" value={imei} onChange={(e) => setImei(e.target.value)} />
              </label>
              <div className="adm__row">
                <label>
                  Custo (R$)
                  <input type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
                </label>
                <label>
                  Preço de venda (R$)
                  <input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
                </label>
              </div>
              <label>
                Anotação interna
                <input placeholder="Ex.: comprado de fulano, acompanha carregador" value={internal} onChange={(e) => setInternal(e.target.value)} />
              </label>
            </fieldset>
          </div>
        </div>

        <footer>
          {err && <p className="adm__err" role="alert">{err}</p>}
          <button type="button" className="adm__btn adm__btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="adm__btn" disabled={busy}>
            {busy ? "Salvando…" : item ? "Salvar alterações" : "Adicionar ao estoque"}
          </button>
        </footer>
      </form>
    </div>
  );
}
