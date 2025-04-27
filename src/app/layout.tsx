import './globals.css'
import { Inter } from 'next/font/google'
import { SideNav } from './components/SideNav'
import { AppProvider } from './contexts/AppContext'
import { AuthProvider } from './contexts/AuthContext'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Menu, SmileIcon as Tooth } from 'lucide-react'
import { UserMenu } from './components/UserMenu'

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
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

