import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ClientProviders } from '../components/client-providers'
import { MainLayout } from '../components/main-layout'
import './globals.css'

export const metadata = {
  title: 'Barangay Complaint Management System',
  description: 'Submit and track community complaints efficiently',
  generator: 'v0.app',
  icons: {
    icon: '/Lguconnect.png',
    shortcut: '/Lguconnect.png',
    apple: '/Lguconnect.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ClientProviders>
          <MainLayout>
            {children}
          </MainLayout>
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  )
}
