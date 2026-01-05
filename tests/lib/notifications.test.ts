/**
 * Notifications Library Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  NotificationFactory,
} from '@/lib/notifications'

describe('Notifications', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('addNotification', () => {
    it('adds a new notification', () => {
      const notification = addNotification({
        type: 'appointment',
        title: 'Test Notification',
        message: 'This is a test',
        priority: 'medium',
      })

      expect(notification.id).toBeDefined()
      expect(notification.title).toBe('Test Notification')
      expect(notification.read).toBe(false)
    })

    it('adds notification to the beginning of the list', () => {
      addNotification({
        type: 'appointment',
        title: 'First',
        message: 'First notification',
        priority: 'medium',
      })

      addNotification({
        type: 'screening',
        title: 'Second',
        message: 'Second notification',
        priority: 'medium',
      })

      const notifications = getNotifications()
      expect(notifications[0].title).toBe('Second')
      expect(notifications[1].title).toBe('First')
    })
  })

  describe('markAsRead', () => {
    it('marks a notification as read', () => {
      const notification = addNotification({
        type: 'appointment',
        title: 'Test',
        message: 'Test',
        priority: 'medium',
      })

      markAsRead(notification.id)

      const notifications = getNotifications()
      expect(notifications[0].read).toBe(true)
    })
  })

  describe('markAllAsRead', () => {
    it('marks all notifications as read', () => {
      addNotification({ type: 'appointment', title: 'Test 1', message: 'Test', priority: 'medium' })
      addNotification({ type: 'screening', title: 'Test 2', message: 'Test', priority: 'medium' })
      addNotification({ type: 'trial', title: 'Test 3', message: 'Test', priority: 'medium' })

      markAllAsRead()

      const notifications = getNotifications()
      expect(notifications.every(n => n.read)).toBe(true)
    })
  })

  describe('deleteNotification', () => {
    it('removes a notification', () => {
      const notification = addNotification({
        type: 'appointment',
        title: 'To Delete',
        message: 'This will be deleted',
        priority: 'medium',
      })

      deleteNotification(notification.id)

      const notifications = getNotifications()
      expect(notifications.find(n => n.id === notification.id)).toBeUndefined()
    })
  })

  describe('getUnreadCount', () => {
    it('returns correct unread count', () => {
      addNotification({ type: 'appointment', title: 'Test 1', message: 'Test', priority: 'medium' })
      addNotification({ type: 'screening', title: 'Test 2', message: 'Test', priority: 'medium' })
      
      const notification = addNotification({ type: 'trial', title: 'Test 3', message: 'Test', priority: 'medium' })
      markAsRead(notification.id)

      expect(getUnreadCount()).toBe(2)
    })
  })

  describe('NotificationFactory', () => {
    it('creates appointment reminder notification', () => {
      const notification = NotificationFactory.appointmentReminder(
        'Dr. Smith',
        new Date(Date.now() + 86400000), // Tomorrow
        'appt-123'
      )

      expect(notification.type).toBe('appointment')
      expect(notification.title).toBe('Upcoming Appointment')
      expect(notification.priority).toBe('high')
    })

    it('creates screening due notification', () => {
      const notification = NotificationFactory.screeningDue(
        'Colonoscopy',
        new Date(Date.now() + 86400000 * 7) // Next week
      )

      expect(notification.type).toBe('screening')
      expect(notification.title).toBe('Screening Reminder')
    })

    it('creates trial match notification', () => {
      const notification = NotificationFactory.trialMatch(
        'Cancer Study',
        85,
        'NCT12345'
      )

      expect(notification.type).toBe('trial')
      expect(notification.message).toContain('85%')
    })
  })
})

