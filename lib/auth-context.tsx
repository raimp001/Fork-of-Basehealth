"use client"

import { createContext, useContext, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

export type UserRole = 'PATIENT' | 'PROVIDER' | 'CAREGIVER' | 'ADMIN'

interface User {
  id: string
  email?: string | null
  name?: string | null
  role: UserRole
  image?: string | null
  walletAddress?: string | null
  privyUserId?: string | null
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
    email: (session.user as any).email ?? null,
    name: (session.user as any).name ?? null,
    role: ((session.user as any).role as UserRole) ?? 'PATIENT',
    image: (session.user as any).image ?? null,
    walletAddress: (session.user as any).walletAddress ?? null,
    privyUserId: (session.user as any).privyUserId ?? null,
  } : null

  const value: AuthContextType = {
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isPatient: user?.role === 'PATIENT',
    isProvider: user?.role === 'PROVIDER',
    isCaregiver: user?.role === 'CAREGIVER',
    isAdmin: user?.role === 'ADMIN'
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
