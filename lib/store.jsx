'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const KEY = 'sa_data';
export const today = () => new Date().toISOString().slice(0, 10);
export const mon = () => today().slice(0, 7);
export const nm = (S, id) => S.ben.find((b) => b.id === id)?.name || id;
export const stock = (S, n) => S.inv.find((i) => i.n === n);
export const entry = (it, t, q, m) => ({ id: Date.now() + Math.random(), date: today(), it, t, q, ...(m ? { m: 1 } : {}) });

const seed = () => ({
  ben: [
    { id: 'SB-0001', name: 'Amina Yusuf', village: 'Kalma', fam: 6, tag: 'Widow', photo: '', g: 'Female', age: '34', ph: '' },
    { id: 'SB-0002', name: 'Omer Adam', village: 'Tawila', fam: 4, tag: 'Disabled', photo: '', g: 'Male', age: '41', ph: '' },
  ],
  dist: [], clin: [], log: [],
  inv: [
    { n: 'Food Kit', u: 'kg', q: 2000 }, { n: 'Wash Kit', u: 'items', q: 300 }, { n: 'Shelter Kit', u: 'items', q: 120 },
    { n: 'Paracetamol', u: 'tabs', q: 900, d: 1 }, { n: 'ORS sachets', u: 'items', q: 400, d: 1 }, { n: 'Amoxicillin', u: 'caps', q: 500, d: 1 },
  ],
});

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [S, setS] = useState(null);
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let d = null, u = null;
    try {
      d = JSON.parse(localStorage.getItem(KEY));
      u = JSON.parse(localStorage.getItem('sa_session')) || JSON.parse(sessionStorage.getItem('sa_session'));
    } catch {}
    setS(d || seed());
    setUser(u || null);
  }, []);

  // update(draft => { ...mutate draft... }) clones state, applies the change and saves to the device.
  const update = useCallback((fn) => setS((prev) => {
    const n = structuredClone(prev);
    fn(n);
    try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {}
    return n;
  }), []);

  const signIn = (u, remember) => {
    setUser(u);
    try { (remember ? localStorage : sessionStorage).setItem('sa_session', JSON.stringify(u)); } catch {}
  };
  const signOut = () => {
    setUser(null);
    try { localStorage.removeItem('sa_session'); sessionStorage.removeItem('sa_session'); } catch {}
  };

  return <Ctx.Provider value={{ S, update, user, signIn, signOut, ready: S !== null && user !== undefined }}>{children}</Ctx.Provider>;
}
