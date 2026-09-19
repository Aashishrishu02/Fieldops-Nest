import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '../components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FieldOps — Enterprise Field Operations & Dispatch Suite',
  description: 'Clean, modern operations dashboard for managing field workforce, dispatch visits, and role-based access.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-[#F7F7F5] text-slate-900 min-h-screen antialiased selection:bg-slate-900 selection:text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
