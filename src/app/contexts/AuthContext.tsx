'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type Role = 'admin' | 'doctor' | null

interface User {
  firstLogin: any
  id: number
  username: string
  role: Role
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else if (pathname !== '/login') {
      router.push('/login')
    }
  }, [pathname, router])

  const login = async (username: string, password: string) => {
    // This is a mock login. In a real application, you would validate credentials against a backend.
    const mockUsers = [
      { id: 1, username: 'admin', password: 'admin', role: 'admin' as Role },
      { id: 2, username: 'doctor1', password: 'doctor1', role: 'doctor' as Role },
      { id: 3, username: 'doctor2', password: 'doctor2', role: 'doctor' as Role },
    ]

    const user = mockUsers.find(u => u.username === username && u.password === password)

    if (user) {
      const { password, ...userWithoutPassword } = user
      //setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
      router.push('/dashboard')
    } else {
      throw new Error('Invalid credentials')
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

