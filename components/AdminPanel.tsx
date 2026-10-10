"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { CONDITIONS, type Condition } from "@/lib/data";
import { firebaseConfigured } from "@/lib/firebase";
import { useStock } from "@/lib/stock";

const MODELS = [
  "iPhone 11 Pro Max", "iPhone 12 Pro Max", "iPhone 13 Pro Max", "iPhone 14 Pro Max", "iPhone 15 Pro Max", "iPhone 16 Pro Max",
  "iPhone 17", "iPhone 17 Pro", "iPhone 17 Pro Max", "iPhone 18 Pro", "iPhone 18 Pro Max",
];
const STORAGES = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];

/** Resizes the photo in the browser and returns a small WebP data URL (saved inside the Firestore document, no Storage needed). */
async function photoToDataUrl(file: File, max = 900): Promise<string> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/webp", 0.85);
}

const errMsg = (e: unknown) => {
  const code = (e as { code?: string })?.code ?? "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "E-mail ou senha incorretos.";
  if (code.includes("permission-denied")) return "Sem permissão. Este e-mail não está autorizado a editar o estoque.";
  if (code.includes("too-many-requests")) return "Muitas tentativas. Aguarde um pouco e tente de novo.";
  return "Algo deu errado. Tente novamente.";
};

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) return;
    let off = () => {};
    (async () => {
      const [{ getAuth, onAuthStateChanged }, { firebaseApp }] = await Promise.all([import("firebase/auth"), import("@/lib/firebase")]);
      off = onAuthStateChanged(getAuth(firebaseApp()), (u) => {
        setUser(u);
        setReady(true);
      });
    })();
    return () => off();
  }, []);

  const signOut = async () => {
    const [{ getAuth, signOut }, { firebaseApp }] = await Promise.all([import("firebase/auth"), import("@/lib/firebase")]);
    await signOut(getAuth(firebaseApp()));
  };

  return (
    <main className="adm">
      <header className="adm__top">
        <Link href="/" className="adm__back">
          ← Ver o site
        </Link>
        {user && (
          <button className="adm__link" onClick={signOut}>
            Sair
          </button>
        )}
      </header>

      {!firebaseConfigured ? (
        <div className="adm__box">
          <h1>Painel não configurado</h1>
          <p>O Firebase ainda não foi ligado ao site. Veja o passo a passo no arquivo ADMIN.md.</p>
        </div>
      ) : !ready ? (
        <p className="adm__muted">Carregando…</p>
      ) : user ? (
        <Dashboard />
      ) : (
        <Login />
      )}
    </main>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const [{ getAuth, signInWithEmailAndPassword }, { firebaseApp }] = await Promise.all([import("firebase/auth"), import("@/lib/firebase")]);
      await signInWithEmailAndPassword(getAuth(firebaseApp()), email.trim(), pass);
    } catch (e) {
      setErr(errMsg(e));
    }
    setBusy(false);
  };

  return (
    <form className="adm__box" onSubmit={submit}>
      <h1>Entrar</h1>
      <p className="adm__muted">Área restrita aos donos da iHub.</p>
      <label>
        E-mail
        <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Senha
        <input type="password" required autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} />
      </label>
      {err && <p className="adm__err">{err}</p>}
      <button className="btn btn--navy" disabled={busy}>
        {busy ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

function Dashboard() {
  const { items, loading } = useStock();
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState("256 GB");
  const [color, setColor] = useState("");
  const [condition, setCondition] = useState<Condition>("lacrado");
  const [battery, setBattery] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const db = async () => {
    const [fs, { firebaseApp }] = await Promise.all([import("firebase/firestore"), import("@/lib/firebase")]);
    return { fs, db: fs.getFirestore(firebaseApp()) };
  };

  const pick = async (f?: File) => {
    if (!f) return;
    try {
      setPhoto(await photoToDataUrl(f));
    } catch {
      setMsg("Não consegui ler essa foto. Tente outra.");
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return setMsg("Escolha uma foto do aparelho.");
    setBusy(true);
    setMsg("");
    try {
      const { fs, db: d } = await db();
      const doc: Record<string, unknown> = { model: model.trim(), storage, color: color.trim(), condition, img: photo, createdAt: fs.serverTimestamp() };
      if (condition !== "lacrado" && battery) doc.battery = Number(battery);
      if (note.trim()) doc.note = note.trim();
      await fs.addDoc(fs.collection(d, "stock"), doc);
      setModel("");
      setColor("");
      setBattery("");
      setNote("");
      setPhoto("");
      setMsg("Celular adicionado ao catálogo!");
    } catch (e) {
      setMsg(errMsg(e));
    }
    setBusy(false);
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Retirar "${name}" do catálogo?`)) return;
    try {
      const { fs, db: d } = await db();
      await fs.deleteDoc(fs.doc(d, "stock", id));
    } catch (e) {
      setMsg(errMsg(e));
    }
  };

  return (
    <>
      <form className="adm__box" onSubmit={add}>
        <h1>Adicionar celular</h1>
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
        </div>
        <label>
          Observação (opcional)
          <input placeholder="Ex.: marcas leves na lateral" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <label>
          Foto
          <input type="file" accept="image/*" onChange={(e) => pick(e.target.files?.[0])} />
        </label>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="adm__preview" src={photo} alt="Pré-visualização" />
        )}
        {msg && <p className={msg.includes("adicionado") ? "adm__ok" : "adm__err"}>{msg}</p>}
        <button className="btn btn--navy" disabled={busy}>
          {busy ? "Salvando…" : "Adicionar ao catálogo"}
        </button>
      </form>

      <section className="adm__box adm__box--wide">
        <h2>No catálogo ({items.length})</h2>
        {loading && <p className="adm__muted">Carregando…</p>}
        {!loading && items.length === 0 && <p className="adm__muted">Nenhum celular cadastrado ainda.</p>}
        <ul className="adm__list">
          {items.map((s) => (
            <li key={s.id}>
              <div className="adm__thumb">
                <Image src={s.img} alt="" fill sizes="64px" unoptimized />
              </div>
              <div>
                <strong>{s.model}</strong>
                <span>
                  {s.storage} · {s.color} · {CONDITIONS.find((c) => c.id === s.condition)?.label}
                  {s.battery ? ` · Bateria ${s.battery}%` : ""}
                </span>
              </div>
              <button className="adm__del" onClick={() => remove(s.id!, `${s.model} ${s.color}`)}>
                Retirar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
