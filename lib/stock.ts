"use client";

import { useEffect, useState } from "react";
import { STOCK, type StockItem } from "./data";
import { firebaseConfigured } from "./firebase";

/** Live stock from Firestore (collection "stock"); falls back to the sample list while Firebase isn't configured. */
export function useStock({ includeSold = false } = {}) {
  const [items, setItems] = useState<StockItem[]>(firebaseConfigured ? [] : STOCK);
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) return;
    let off = () => {};
    (async () => {
      const [{ getFirestore, collection, query, orderBy, onSnapshot }, { firebaseApp }] = await Promise.all([
        import("firebase/firestore"),
        import("./firebase"),
      ]);
      const q = query(collection(getFirestore(firebaseApp()), "stock"), orderBy("createdAt", "desc"));
      off = onSnapshot(
        q,
        (snap) => {
          const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StockItem, "id">) }));
          setItems(includeSold ? all : all.filter((i) => i.status !== "vendido"));
          setLoading(false);
        },
        () => setLoading(false)
      );
    })();
    return () => off();
  }, [includeSold]);

  return { items, loading };
}
