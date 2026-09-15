import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import VizoraQueryProvider from './VizoraQueryProvider'

export const metadata: Metadata = {
  title: 'Vizora — Dynamic Dashboard Builder',
  description: 'Build interactive dashboards from SQL Server data sources.',
}

export const viewport: Viewport = {
  themeColor: '#01b0c1',
}

export default function VizoraLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <VizoraQueryProvider>
      {children}
      <Toaster richColors position="bottom-right" />
    </VizoraQueryProvider>
  )
}
