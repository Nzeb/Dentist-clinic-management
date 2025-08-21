'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import { SideNav } from './components/SideNav'
import { AppProvider } from './contexts/AppContext'
import { AuthProvider } from './contexts/AuthContext'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SmileIcon as Tooth } from 'lucide-react'
import { UserMenu } from './components/UserMenu'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login'

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppProvider>
            {isAuthPage ? (
              <div className="flex items-center justify-center h-screen">
                {children}
              </div>
            ) : (
              <SidebarProvider>
                <div className="flex h-screen w-full flex-col">
                  <header className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center">
                      <Tooth className="h-6 w-6 mr-2" />
                      <h1 className="text-xl font-bold">Dental Clinic</h1>
                    </div>
                    <UserMenu />
                  </header>
                  <div className="flex flex-1 overflow-hidden">
                    <SideNav />
                    <SidebarInset className="flex-1 overflow-auto">
                      <main className="flex-1 overflow-y-auto p-8">
                        {children}
                      </main>
                    </SidebarInset>
                  </div>
                </div>
              </SidebarProvider>
            )}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
