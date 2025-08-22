'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, Users, Calendar, Stethoscope, Receipt, LogOut } from 'lucide-react'

const adminNavItems = [
  { name: 'User Management', href: '/users', icon: Users },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Billing', href: '/billing', icon: Receipt },
  { name: 'Profile', href: '/profile', icon: Receipt },
]

const doctorNavItems = [
  { name: 'My Patients', href: '/my-patients', icon: Users },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Profile', href: '/profile', icon: Receipt },
]

const receptionNavItems = [
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: Receipt },
]

export function SideNav() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const navItems = user?.role.toLowerCase() === 'admin' ? adminNavItems : user?.role.toLowerCase() === 'doctor' ? doctorNavItems : receptionNavItems

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <ScrollArea className="flex-grow">
        <div className="flex flex-col gap-2 p-4">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Dental Clinic
          </h2>
          <nav className="flex flex-col gap-1">
            {navItems.map((item, index) => (
              <Button
                key={index}
                asChild
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="justify-start"
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </ScrollArea>
      <div className="p-4">
        <Button
          onClick={logout}
          variant="outline"
          className="w-full justify-start"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  )
}

