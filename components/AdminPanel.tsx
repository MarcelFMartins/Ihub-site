"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { firebaseConfigured } from "@/lib/firebase";
import Logo from "./Logo";
import Login from "./admin/Login";
import Inventory from "./admin/Inventory";

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

  if (!firebaseConfigured)
    return (
      <main className="adm adm--center">
        <Logo className="adm__logo" ink="#0B1533" />
        <div className="adm__card">
          <h1>Painel não configurado</h1>
          <p className="adm__muted">O Firebase ainda não foi ligado ao site. Veja o passo a passo em ADMIN.md.</p>
          <Link className="adm__btn" href="/">
            Voltar ao site
          </Link>
        </div>
      </main>
    );

  if (!ready)
    return (
      <main className="adm adm--center">
        <div className="adm__spinner" aria-label="Carregando" />
      </main>
    );

  return user ? <Inventory user={user} onSignOut={signOut} /> : <Login />;
}
