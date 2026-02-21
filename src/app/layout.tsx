import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestionale Centro Estetico',
  description: 'Sistema di gestione clienti e appuntamenti con promemoria WhatsApp',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
