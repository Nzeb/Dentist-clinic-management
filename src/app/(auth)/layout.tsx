import { Inter } from 'next/font/google'
import { AppProvider } from '../contexts/AppContext'
import { AuthProvider } from '../contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppProvider>
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

