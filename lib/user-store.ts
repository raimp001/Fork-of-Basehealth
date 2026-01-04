/**
 * Shared User Store
 * 
 * Centralized in-memory user storage for authentication
 * Note: In production, this should be replaced with a proper database
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

// Demo users with pre-hashed passwords (password: password123)
const DEMO_PASSWORD_HASH = "$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u"

// Shared user store - single source of truth
const users: StoredUser[] = [
  {
    id: "1",
    email: "patient@demo.com",
    password: DEMO_PASSWORD_HASH,
    name: "John Doe",
    role: "patient",
    image: "/placeholder.svg",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    email: "provider@demo.com",
    password: DEMO_PASSWORD_HASH,
    name: "Dr. Sarah Johnson",
    role: "provider",
    image: "/placeholder.svg",
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    email: "caregiver@demo.com",
    password: DEMO_PASSWORD_HASH,
    name: "Maria Rodriguez",
    role: "caregiver",
    image: "/placeholder.svg",
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    email: "admin@demo.com",
    password: DEMO_PASSWORD_HASH,
    name: "Admin User",
    role: "admin",
    image: "/placeholder.svg",
    createdAt: new Date().toISOString()
  }
]

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

