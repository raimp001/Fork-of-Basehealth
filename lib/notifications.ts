/**
 * BaseHealth Notification System
 * Handles in-app notifications, reminders, and alerts
 */

export interface Notification {
  id: string
  type: 'appointment' | 'screening' | 'trial' | 'message' | 'reminder' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  metadata?: Record<string, unknown>
}

export interface NotificationPreferences {
  appointments: boolean
  screenings: boolean
  trials: boolean
  tips: boolean
  messages: boolean
  emailDigest: 'none' | 'daily' | 'weekly'
  pushEnabled: boolean
}

// Default preferences
export const DEFAULT_PREFERENCES: NotificationPreferences = {
  appointments: true,
  screenings: true,
  trials: true,
  tips: true,
  messages: true,
  emailDigest: 'weekly',
  pushEnabled: false,
}

// Notification type configurations
export const NOTIFICATION_CONFIG = {
  appointment: {
    icon: 'calendar',
    color: 'blue',
    defaultPriority: 'high' as const,
  },
  screening: {
    icon: 'activity',
    color: 'green',
    defaultPriority: 'medium' as const,
  },
  trial: {
    icon: 'flask',
    color: 'purple',
    defaultPriority: 'low' as const,
  },
  message: {
    icon: 'message',
    color: 'blue',
    defaultPriority: 'medium' as const,
  },
  reminder: {
    icon: 'bell',
    color: 'amber',
    defaultPriority: 'medium' as const,
  },
  system: {
    icon: 'info',
    color: 'stone',
    defaultPriority: 'low' as const,
  },
}

// Generate a unique ID
function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Storage keys
const STORAGE_KEYS = {
  notifications: 'basehealth_notifications',
  preferences: 'basehealth_notification_preferences',
  lastRead: 'basehealth_notifications_last_read',
}

// Get notifications from storage
export function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.notifications)
    if (!stored) return []
    
    const notifications = JSON.parse(stored) as Notification[]
    return notifications.map(n => ({
      ...n,
      timestamp: new Date(n.timestamp)
    }))
  } catch {
    return []
  }
}

// Save notifications to storage
function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications))
}

// Add a new notification
export function addNotification(
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
): Notification {
  const newNotification: Notification = {
    ...notification,
    id: generateId(),
    timestamp: new Date(),
    read: false,
  }
  
  const notifications = getNotifications()
  notifications.unshift(newNotification)
  
  // Keep only last 100 notifications
  const trimmed = notifications.slice(0, 100)
  saveNotifications(trimmed)
  
  // Dispatch event for real-time updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('notification-added', { detail: newNotification }))
  }
  
  return newNotification
}

// Mark notification as read
export function markAsRead(id: string): void {
  const notifications = getNotifications()
  const updated = notifications.map(n => 
    n.id === id ? { ...n, read: true } : n
  )
  saveNotifications(updated)
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('notification-read', { detail: id }))
  }
}

// Mark all as read
export function markAllAsRead(): void {
  const notifications = getNotifications()
  const updated = notifications.map(n => ({ ...n, read: true }))
  saveNotifications(updated)
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('notifications-all-read'))
  }
}

// Delete notification
export function deleteNotification(id: string): void {
  const notifications = getNotifications()
  const filtered = notifications.filter(n => n.id !== id)
  saveNotifications(filtered)
}

// Get unread count
export function getUnreadCount(): number {
  const notifications = getNotifications()
  return notifications.filter(n => !n.read).length
}

// Get preferences
export function getPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.preferences)
    if (!stored) return DEFAULT_PREFERENCES
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

// Save preferences
export function savePreferences(preferences: Partial<NotificationPreferences>): void {
  if (typeof window === 'undefined') return
  
  const current = getPreferences()
  const updated = { ...current, ...preferences }
  localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(updated))
}

// Create common notification types
export const NotificationFactory = {
  appointmentReminder: (
    providerName: string,
    date: Date,
    appointmentId: string
  ): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
    type: 'appointment',
    title: 'Upcoming Appointment',
    message: `Your appointment with ${providerName} is ${formatTimeUntil(date)}`,
    priority: 'high',
    actionUrl: `/appointment/${appointmentId}`,
    actionLabel: 'View Details',
    metadata: { appointmentId, providerName, date: date.toISOString() }
  }),

  screeningDue: (
    screeningName: string,
    dueDate: Date
  ): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
    type: 'screening',
    title: 'Screening Reminder',
    message: `Your ${screeningName} is due ${formatTimeUntil(dueDate)}`,
    priority: 'medium',
    actionUrl: '/screening',
    actionLabel: 'Schedule Now',
    metadata: { screeningName, dueDate: dueDate.toISOString() }
  }),

  trialMatch: (
    trialTitle: string,
    matchScore: number,
    nctId: string
  ): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
    type: 'trial',
    title: 'New Trial Match',
    message: `${trialTitle} matches ${matchScore}% of your health profile`,
    priority: 'low',
    actionUrl: `/clinical-trials?highlight=${nctId}`,
    actionLabel: 'Learn More',
    metadata: { nctId, matchScore }
  }),

  medicationReminder: (
    medicationName: string,
    dosage: string
  ): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
    type: 'reminder',
    title: 'Medication Reminder',
    message: `Time to take ${medicationName} (${dosage})`,
    priority: 'high',
    actionUrl: '/medication',
    actionLabel: 'Mark Taken',
    metadata: { medicationName, dosage }
  }),

  newMessage: (
    senderName: string,
    preview: string,
    conversationId: string
  ): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
    type: 'message',
    title: `Message from ${senderName}`,
    message: preview.length > 100 ? preview.slice(0, 97) + '...' : preview,
    priority: 'medium',
    actionUrl: `/chat?conversation=${conversationId}`,
    actionLabel: 'Reply',
    metadata: { senderName, conversationId }
  }),

  systemAlert: (
    title: string,
    message: string,
    actionUrl?: string
  ): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
    type: 'system',
    title,
    message,
    priority: 'low',
    actionUrl,
    actionLabel: actionUrl ? 'View' : undefined,
  }),
}

// Helper: format time until a date
function formatTimeUntil(date: Date): string {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  
  if (diff < 0) return 'overdue'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 7) {
    return `on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  } else if (days > 1) {
    return `in ${days} days`
  } else if (days === 1) {
    return 'tomorrow'
  } else if (hours > 1) {
    return `in ${hours} hours`
  } else if (hours === 1) {
    return 'in 1 hour'
  } else {
    return 'soon'
  }
}

// Request push notification permission
export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  if (Notification.permission === 'denied') {
    return false
  }
  
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Send push notification (if supported)
export function sendPushNotification(title: string, options?: NotificationOptions): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  
  new Notification(title, {
    icon: '/logo.png',
    badge: '/logo.png',
    ...options,
  })
}

// Schedule a reminder
export function scheduleReminder(
  title: string,
  message: string,
  date: Date,
  notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>
): string {
  const id = generateId()
  const delay = date.getTime() - Date.now()
  
  if (delay <= 0) {
    // If date is in the past, add immediately
    addNotification(notificationData)
  } else {
    // Schedule for future
    setTimeout(() => {
      addNotification(notificationData)
      
      // Also send push if enabled
      const prefs = getPreferences()
      if (prefs.pushEnabled) {
        sendPushNotification(title, { body: message })
      }
    }, delay)
  }
  
  return id
}

