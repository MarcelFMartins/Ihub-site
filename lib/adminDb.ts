"use client";

import { useEffect, useState } from "react";
import type { Condition, Status } from "./data";

/** Dados internos: ficam em `stock_private`, que só os donos conseguem ler. */
export type Private = { imei?: string; cost?: number; price?: number; soldAt?: number; soldPrice?: number; internalNote?: string };
export type Pub = {
  model: string; storage: string; color: string; condition: Condition; battery?: number; note?: string; status: Status;
  img: string; imgs: string[]; description?: string; featured: boolean; badge?: string;
};

async function fb() {
  const [fs, { firebaseApp }] = await Promise.all([import("firebase/firestore"), import("./firebase")]);
  return { fs, db: fs.getFirestore(firebaseApp()) };
}

/** Escrita: valores `undefined` viram "apagar campo" ao editar e são omitidos ao criar. */
function clean(o: object, edit: boolean, deleteField: () => unknown) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) {
    if (v !== undefined) out[k] = v;
    else if (edit) out[k] = deleteField();
  }
  return out;
}

export async function saveItem(id: string | null, pub: Pub, priv: Private) {
  const { fs, db } = await fb();
  const ref = id ? fs.doc(db, "stock", id) : fs.doc(fs.collection(db, "stock"));
  const edit = Boolean(id);
  const batch = fs.writeBatch(db);
  batch.set(ref, { ...clean(pub, edit, fs.deleteField), ...(edit ? {} : { createdAt: fs.serverTimestamp() }) }, { merge: true });
  batch.set(fs.doc(db, "stock_private", ref.id), clean(priv, edit, fs.deleteField), { merge: true });
  await batch.commit();
}

export async function setStatus(id: string, status: Status, soldPrice?: number) {
  const { fs, db } = await fb();
  const batch = fs.writeBatch(db);
  batch.update(fs.doc(db, "stock", id), { status });
  batch.set(
    fs.doc(db, "stock_private", id),
    status === "vendido" ? { soldAt: Date.now(), soldPrice: soldPrice ?? null } : { soldAt: fs.deleteField(), soldPrice: fs.deleteField() },
    { merge: true }
  );
  await batch.commit();
}

export async function removeItem(id: string) {
  const { fs, db } = await fb();
  const batch = fs.writeBatch(db);
  batch.delete(fs.doc(db, "stock", id));
  batch.delete(fs.doc(db, "stock_private", id));
  await batch.commit();
}

export function usePrivate() {
  const [map, setMap] = useState<Record<string, Private>>({});
  const [denied, setDenied] = useState(false);
  useEffect(() => {
    let off = () => {};
    fb().then(({ fs, db }) => {
      off = fs.onSnapshot(fs.collection(db, "stock_private"), (snap) => {
        const m: Record<string, Private> = {};
        snap.forEach((d) => (m[d.id] = d.data() as Private));
        setMap(m);
        setDenied(false);
      }, (e) => setDenied(((e as { code?: string }).code ?? "").includes("permission")));
    });
    return () => off();
  }, []);
  return { map, denied };
}

/** Reduz a foto no navegador e devolve um WebP pequeno (data URL) para salvar no documento. */
export async function photoToDataUrl(file: File, max = 800): Promise<string> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/webp", 0.8);
}

export const brl = (n?: number) => (n == null ? "—" : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));

/** Valor curto para os cards de resumo: R$ 950, R$ 67,5 mil, R$ 1,2 mi. */
export const brlShort = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).replace(/\s?mil/, " mil").replace(/\s?mi$/, " mi");
