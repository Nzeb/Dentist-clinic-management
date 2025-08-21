import './globals.css'
import { Inter } from 'next/font/google'
import { AppProvider } from './contexts/AppContext'
import { AuthProvider } from './contexts/AuthContext'
import { AppShell } from './components/AppShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Dentist Clinic Management System',
  description: 'Manage your dental clinic efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppProvider>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
