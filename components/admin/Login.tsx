"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "../Logo";

const errMsg = (e: unknown) => {
  const code = (e as { code?: string })?.code ?? "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found") || code.includes("invalid-email"))
    return "E-mail ou senha incorretos.";
  if (code.includes("too-many-requests")) return "Muitas tentativas. Aguarde um pouco e tente de novo.";
  if (code.includes("network")) return "Sem conexão. Verifique a internet.";
  return "Não foi possível entrar. Tente novamente.";
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const auth = async () => {
    const [m, { firebaseApp }] = await Promise.all([import("firebase/auth"), import("@/lib/firebase")]);
    return { m, a: m.getAuth(firebaseApp()) };
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setInfo("");
    try {
      const { m, a } = await auth();
      await m.signInWithEmailAndPassword(a, email.trim(), pass);
    } catch (e) {
      setErr(errMsg(e));
      setBusy(false);
    }
  };

  const reset = async () => {
    setErr("");
    setInfo("");
    if (!email.trim()) return setErr("Digite seu e-mail acima para receber o link de nova senha.");
    try {
      const { m, a } = await auth();
      await m.sendPasswordResetEmail(a, email.trim());
    } catch {
      /* resposta igual de propósito: não revela quais e-mails existem */
    }
    setInfo("Se este e-mail tiver acesso, enviamos um link para criar uma nova senha.");
  };

  return (
    <main className="login">
      <aside className="login__side">
        <Logo className="login__logo" ink="#fff" />
        <div>
          <h2>Painel de estoque</h2>
          <p>Cadastre aparelhos, controle reservas e vendas e mantenha o catálogo do site sempre atualizado.</p>
        </div>
        <span>Acesso restrito à equipe iHub.</span>
      </aside>
      <section className="login__main">
        <form className="login__form" onSubmit={submit}>
          <Logo className="login__logo login__logo--mobile" ink="#0B1533" />
          <h1>Entrar</h1>
          <p className="adm__muted">Use o e-mail e a senha cadastrados para a equipe.</p>
          <label>
            E-mail
            <input type="email" required autoComplete="username" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Senha
            <span className="login__pass">
              <input type={show ? "text" : "password"} required autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
                {show ? "Ocultar" : "Mostrar"}
              </button>
            </span>
          </label>
          {err && <p className="adm__err" role="alert">{err}</p>}
          {info && <p className="adm__ok">{info}</p>}
          <button className="adm__btn adm__btn--lg" disabled={busy}>
            {busy ? "Entrando…" : "Entrar"}
          </button>
          <button type="button" className="adm__link" onClick={reset}>
            Esqueci minha senha
          </button>
          <Link href="/" className="adm__link adm__link--muted">
            ← Voltar ao site
          </Link>
        </form>
      </section>
    </main>
  );
}
