"use client"

import { createContext, useContext, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  email: string
  name: string
  role: 'patient' | 'provider' | 'caregiver' | 'admin'
  image?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isPatient: boolean
  isProvider: boolean
  isCaregiver: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isPatient: false,
  isProvider: false,
  isCaregiver: false,
  isAdmin: false
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  
  const user = session?.user ? {
    id: session.user.id as string,
    email: session.user.email as string,
    name: session.user.name as string,
    role: session.user.role as 'patient' | 'provider' | 'caregiver' | 'admin',
    image: session.user.image as string | undefined
  } : null

  const value: AuthContextType = {
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isPatient: user?.role === 'patient',
    isProvider: user?.role === 'provider',
    isCaregiver: user?.role === 'caregiver',
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
