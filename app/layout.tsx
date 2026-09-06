import './globals.css';

export const metadata = {
  title: 'Reiz - Entraide scolaire',
  description: 'Partage de fiches de révision et messagerie entre étudiants',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
