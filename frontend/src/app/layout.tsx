import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ela GPT - AI Platform',
  description: 'Modern full-stack AI platform with Next.js and FastAPI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-neutral-900">{children}</body>
    </html>
  );
}
