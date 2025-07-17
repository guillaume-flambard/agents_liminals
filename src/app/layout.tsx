import { Inter, Crimson_Text } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-provider';
import { ToastProvider, Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-crimson',
  display: 'swap',
});

export const metadata = {
  title: 'Agents Liminals - Observatoire des États Intérieurs',
  description: 'Consultations spirituelles et psychologiques avec des agents IA spécialisés dans différents territoires émotionnels',
  keywords: ['spiritualité', 'psychologie', 'consultation', 'IA', 'développement personnel'],
  authors: [{ name: 'Agents Liminals Team' }],
  creator: 'Agents Liminals',
  openGraph: {
    title: 'Agents Liminals - Observatoire des États Intérieurs',
    description: 'Consultations spirituelles et psychologiques avec des agents IA spécialisés',
    url: 'https://liminals.memoapp.eu',
    siteName: 'Agents Liminals',
    locale: 'fr_FR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${crimsonText.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <ToastProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}