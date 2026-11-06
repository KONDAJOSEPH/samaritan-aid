'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ROLES } from '@/lib/constants';

export default function Home() {
  const router = useRouter();
  const { user, ready } = useApp();
  useEffect(() => { if (ready) router.replace(user ? ROLES[user.r][0] : '/login'); }, [ready, user, router]);
  return null;
}
