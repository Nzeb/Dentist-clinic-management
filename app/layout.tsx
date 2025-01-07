import './globals.css'
import { Inter } from 'next/font/google'
import { SideNav } from './components/SideNav'
import { AppProvider } from './contexts/AppContext'
import { AuthProvider } from './contexts/AuthContext'

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
            <div className="flex h-screen">
              <SideNav />
              <main className="flex-1 overflow-y-auto p-8">
                {children}
              </main>
            </div>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

