import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Audimark',
  description: 'Music review and social platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}