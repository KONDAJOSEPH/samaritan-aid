import './globals.css';
import { AppProvider } from '@/lib/store';

export const metadata = { title: 'Samaritan Aid Manager', description: 'Beneficiary registration, aid distribution, mobile clinic, inventory and donor reports.' };
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0a2a6e' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><AppProvider>{children}</AppProvider></body>
    </html>
  );
}
