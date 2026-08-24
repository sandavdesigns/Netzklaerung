import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://netzklaerung-msb-portal.davidm84.chatgpt.site'),
  title: 'NetzKlärung – Marktpartner-Portal',
  description: 'Internes Fallmanagement für Klärfälle zwischen Netzbetreiber, Messstellenbetreiber und Lieferant.',
  openGraph: {
    title: 'NetzKlärung',
    description: 'Klärfälle im Messwesen strukturiert lösen',
    images: [{ url: '/og.png', width: 1672, height: 941, alt: 'NetzKlärung – Klärfälle im Messwesen strukturiert lösen' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NetzKlärung',
    description: 'Klärfälle im Messwesen strukturiert lösen',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
