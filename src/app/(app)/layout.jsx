'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { NAV, ROLES } from '@/lib/constants';
import Logo from '@/components/Logo';

export default function AppShell({ children }) {
  const { user, ready, signOut } = useApp();
  const router = useRouter();
  const path = usePathname();
  const [online, setOnline] = useState(true);
  const tabs = ROLES[user?.r] || [];

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true), off = () => setOnline(false);
    addEventListener('online', on); addEventListener('offline', off);
    return () => { removeEventListener('online', on); removeEventListener('offline', off); };
  }, []);
  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace('/login');
    else if (!tabs.includes(path)) router.replace(tabs[0]);
  }, [ready, user, path, router]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready || !user || !tabs.includes(path)) return null;
  return (
    <>
      {!online && <div className="off">Offline mode: data saved on this device</div>}
      <div className="wrap app">
        <div className="top">
          <div className="row" style={{ gap: 8 }}><Logo size={30} /><b>Samaritan</b></div>
          <div className="m">{user.r} · <a href="#" style={{ color: 'var(--pri)' }} onClick={(e) => { e.preventDefault(); signOut(); router.replace('/login'); }}>Log out</a></div>
        </div>
        <div className="hero"><div>Welcome, {user.u.split('@')[0]}</div><b>{NAV[path][2]}</b></div>
        {children}
      </div>
      <nav>
        {tabs.map((h) => (
          <button key={h} className={h === path ? 'on' : ''} onClick={() => router.push(h)}><span>{NAV[h][0]}</span>{NAV[h][1]}</button>
        ))}
      </nav>
    </>
  );
}
