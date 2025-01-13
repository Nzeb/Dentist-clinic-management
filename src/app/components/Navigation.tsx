'use client'

import Link from 'next/link'
import { HomeIcon, UserIcon, CalendarIcon, FileTextIcon, DollarSignIcon, LogOutIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"

const adminNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Patients', href: '/patients', icon: UserIcon },
  { name: 'Appointments', href: '/appointments', icon: CalendarIcon },
  { name: 'Treatments', href: '/treatments', icon: FileTextIcon },
  { name: 'Billing', href: '/billing', icon: DollarSignIcon },
]

const doctorNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'My Patients', href: '/my-patients', icon: UserIcon },
  { name: 'Appointments', href: '/appointments', icon: CalendarIcon },
]

export default function Navigation() {
  const { user, logout } = useAuth()

  const navItems = user?.role === 'admin' ? adminNavItems : doctorNavItems

  return (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <item.icon className="h-6 w-6" />
          <span>{item.name}</span>
        </Link>
      ))}
      <Button
        onClick={logout}
        className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full justify-start"
      >
        <LogOutIcon className="h-6 w-6" />
        <span>Logout</span>
      </Button>
    </nav>
  )
}

