/**
 * Shared User Store
 * 
 * Centralized in-memory user storage for authentication.
 * In production, this is backed by Prisma/PostgreSQL.
 * 
 * Note: This store starts empty. Users are created through registration.
 */

import bcrypt from 'bcryptjs'

export interface StoredUser {
  id: string
  email: string
  password: string // hashed
  name: string
  role: 'patient' | 'provider' | 'caregiver' | 'admin'
  image: string
  createdAt: string
}

// User store - starts empty, populated by registrations
// Real users are stored in PostgreSQL via Prisma
const users: StoredUser[] = []

/**
 * Find user by email
 */
export function findUserByEmail(email: string): StoredUser | undefined {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase())
}

/**
 * Find user by id
 */
export function findUserById(id: string): StoredUser | undefined {
  return users.find(u => u.id === id)
}

/**
 * Add a new user
 */
export function addUser(user: Omit<StoredUser, 'id' | 'createdAt'>): StoredUser {
  const newUser: StoredUser = {
    ...user,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  users.push(newUser)
  return newUser
}

/**
 * Verify user password
 */
export async function verifyPassword(email: string, password: string): Promise<StoredUser | null> {
  const user = findUserByEmail(email)
  if (!user) return null
  
  const isValid = await bcrypt.compare(password, user.password)
  return isValid ? user : null
}

/**
 * Check if email exists
 */
export function emailExists(email: string): boolean {
  return users.some(u => u.email.toLowerCase() === email.toLowerCase())
}

/**
 * Get all users (for admin purposes)
 */
export function getAllUsers(): Omit<StoredUser, 'password'>[] {
  return users.map(({ password, ...user }) => user)
}
