'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { DEMO, ROLES } from '@/lib/constants';
import Logo from '@/components/Logo';

const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const Eye = ({ off }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" />{off && <path d="M3 3l18 18" />}
  </svg>
);

export default function Login() {
  const router = useRouter();
  const { user, ready, signIn } = useApp();
  const [em, setEm] = useState(''), [pw, setPw] = useState(''), [role, setRole] = useState('Admin');
  const [rm, setRm] = useState(false), [show, setShow] = useState(false), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false);

  useEffect(() => { const r = lsGet('sa_rm'); if (r?.u) { setEm(r.u); setRm(true); } }, []);
  useEffect(() => { if (ready && user) router.replace(ROLES[user.r][0]); }, [ready, user, router]);

  const submit = (e) => {
    e.preventDefault();
    setMsg('');
    const lk = lsGet('sa_lock') || { n: 0 };
    if (lk.n >= 10) { setMsg('Account locked after 10 failed attempts. Contact your administrator.'); return; }
    const u = em.trim().toLowerCase(), off = !navigator.onLine, saved = lsGet('sa_offline');
    if (off && !saved) { setMsg('No saved login on this device. Connect once to enable offline login.'); return; }
    setBusy(true);
    setTimeout(() => {
      const ok = off ? saved.u === u && saved.h === btoa(pw) : u === DEMO.user && pw === DEMO.pass;
      if (!ok) {
        lk.n++; lsSet('sa_lock', lk);
        setMsg('Wrong Email or password' + (lk.n >= 7 ? ` (${10 - lk.n} attempts left)` : ''));
        setBusy(false);
        return;
      }
      localStorage.removeItem('sa_lock');
      lsSet('sa_offline', { u, h: btoa(pw) }); // lets this device log in without internet
      if (rm) lsSet('sa_rm', { u: em.trim() }); else localStorage.removeItem('sa_rm');
      signIn({ u: em.trim(), r: role }, rm);
      router.replace(ROLES[role][0]);
    }, 700);
  };

  return (
    <div className="lgbg">
      <div className="wrap">
        <div className="login">
          <div className="brand"><Logo white /><b>Samaritan</b></div>
          <div className="card">
            <form onSubmit={submit}>
              <h3 style={{ textAlign: 'center', fontSize: 18, margin: '0 0 2px' }}>Welcome back</h3>
              <p className="m" style={{ textAlign: 'center', margin: '0 0 14px' }}>Sign in to continue</p>
              <label htmlFor="em">Email or username</label>
              <input id="em" autoComplete="username" value={em} onChange={(e) => setEm(e.target.value)} placeholder="name@example.org" />
              <label htmlFor="pw">Password</label>
              <div className="pw">
                <input id="pw" type={show ? 'text' : 'password'} autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
                <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}><Eye off={show} /></button>
              </div>
              <label htmlFor="ro">Role</label>
              <select id="ro" value={role} onChange={(e) => setRole(e.target.value)}>{Object.keys(ROLES).map((r) => <option key={r}>{r}</option>)}</select>
              <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <input type="checkbox" checked={rm} onChange={(e) => setRm(e.target.checked)} style={{ width: 22, minHeight: 22, margin: 0 }} />Remember me
              </label>
              <div className="err" role="alert">{msg}</div>
              <button className="btn" disabled={busy}>{busy ? <><span className="spin" />Logging in…</> : 'Login'}</button>
            </form>
            <p style={{ textAlign: 'center', margin: '14px 0 0' }}>
              <a href="#" style={{ color: 'var(--pri)' }} onClick={(e) => { e.preventDefault(); setMsg('Ask your administrator to reset your password.'); }}>Forgot password?</a>
            </p>
          </div>
          <div className="foot">Secure · Offline ready</div>
        </div>
      </div>
    </div>
  );
}
