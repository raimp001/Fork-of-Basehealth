"use client"

/**
 * Notification Center Component
 * In-app notification panel with real-time updates
 */

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Bell,
  Calendar,
  Activity,
  FlaskConical,
  MessageCircle,
  Info,
  Clock,
  Check,
  Trash2,
  Settings,
  X,
  BellRing
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Notification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  NOTIFICATION_CONFIG
} from "@/lib/notifications"
import { formatDistanceToNow } from "date-fns"

const NOTIFICATION_ICONS = {
  appointment: Calendar,
  screening: Activity,
  trial: FlaskConical,
  message: MessageCircle,
  reminder: Clock,
  system: Info,
}

const PRIORITY_COLORS = {
  low: 'bg-stone-100 text-stone-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-600',
  urgent: 'bg-red-100 text-red-600',
}

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
}

function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
  const Icon = NOTIFICATION_ICONS[notification.type] || Info
  const config = NOTIFICATION_CONFIG[notification.type]
  
  return (
    <div
      className={cn(
        "p-4 border-b border-stone-100 hover:bg-stone-50/50 transition-colors cursor-pointer",
        !notification.read && "bg-blue-50/30"
      )}
      onClick={() => !notification.read && onRead(notification.id)}
    >
      <div className="flex gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          config.color === 'blue' && 'bg-blue-100',
          config.color === 'green' && 'bg-green-100',
          config.color === 'purple' && 'bg-purple-100',
          config.color === 'amber' && 'bg-amber-100',
          config.color === 'stone' && 'bg-stone-100',
        )}>
          <Icon className={cn(
            "h-5 w-5",
            config.color === 'blue' && 'text-blue-600',
            config.color === 'green' && 'text-green-600',
            config.color === 'purple' && 'text-purple-600',
            config.color === 'amber' && 'text-amber-600',
            config.color === 'stone' && 'text-stone-600',
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className={cn(
                  "text-sm font-medium text-stone-900 truncate",
                  !notification.read && "font-semibold"
                )}>
                  {notification.title}
                </h4>
                {!notification.read && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-stone-600 mt-0.5 line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(notification.id)
              }}
              className="p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Delete notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {notification.actionUrl && notification.actionLabel && (
            <Link
              href={notification.actionUrl}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              {notification.actionLabel}
              <span className="text-blue-400">→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const loadNotifications = useCallback(() => {
    setNotifications(getNotifications())
    setUnreadCount(getUnreadCount())
  }, [])

  useEffect(() => {
    loadNotifications()
    
    // Listen for notification events
    const handleAdd = () => loadNotifications()
    const handleRead = () => loadNotifications()
    const handleAllRead = () => loadNotifications()
    
    window.addEventListener('notification-added', handleAdd)
    window.addEventListener('notification-read', handleRead)
    window.addEventListener('notifications-all-read', handleAllRead)
    
    return () => {
      window.removeEventListener('notification-added', handleAdd)
      window.removeEventListener('notification-read', handleRead)
      window.removeEventListener('notifications-all-read', handleAllRead)
    }
  }, [loadNotifications])

  const handleRead = (id: string) => {
    markAsRead(id)
    loadNotifications()
  }

  const handleDelete = (id: string) => {
    deleteNotification(id)
    loadNotifications()
  }

  const handleMarkAllRead = () => {
    markAllAsRead()
    loadNotifications()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[380px] p-0 shadow-xl border-stone-200" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-stone-600" />
            <h3 className="font-semibold text-stone-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs text-stone-600 hover:text-stone-900 h-7 px-2"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Link href="/settings?tab=notifications">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-stone-400 hover:text-stone-600"
                aria-label="Notification settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Notification List */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-stone-400" />
              </div>
              <h4 className="font-medium text-stone-900 mb-1">No notifications</h4>
              <p className="text-sm text-stone-500">
                You're all caught up! We'll notify you about appointments, screenings, and more.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 group">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        
        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-stone-200 bg-stone-50/50">
            <Link href="/notifications" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full text-sm text-stone-600 hover:text-stone-900">
                View all notifications
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Bell icon with badge for use in navigation
export function NotificationBell({ className }: { className?: string }) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setUnreadCount(getUnreadCount())
    
    const handleUpdate = () => setUnreadCount(getUnreadCount())
    
    window.addEventListener('notification-added', handleUpdate)
    window.addEventListener('notification-read', handleUpdate)
    window.addEventListener('notifications-all-read', handleUpdate)
    
    return () => {
      window.removeEventListener('notification-added', handleUpdate)
      window.removeEventListener('notification-read', handleUpdate)
      window.removeEventListener('notifications-all-read', handleUpdate)
    }
  }, [])

  return (
    <div className={cn("relative", className)}>
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  )
}

