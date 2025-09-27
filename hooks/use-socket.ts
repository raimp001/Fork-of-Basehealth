"use client"

import { useEffect, useState, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'
import { useAuth } from '@/lib/auth-context'

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (roomId: string, content: string, type?: 'text' | 'image' | 'file') => void
  joinRoom: (roomId: string) => void
  startTyping: (roomId: string) => void
  stopTyping: (roomId: string) => void
  markAsRead: (roomId: string, messageId: string) => void
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
      
      // Authenticate the socket connection
      socketInstance.emit('authenticate', {
        userId: user.id,
        name: user.name,
        role: user.role
      })
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user])

  const sendMessage = useCallback((roomId: string, content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!socket || !user) return

    socket.emit('send_message', {
      roomId,
      senderId: user.id,
      content,
      type
    })
  }, [socket, user])

  const joinRoom = useCallback((roomId: string) => {
    if (!socket || !user) return

    socket.emit('join_room', roomId, user.id)
  }, [socket, user])

  const startTyping = useCallback((roomId: string) => {
    if (!socket || !user) return

    socket.emit('typing_start', {
      roomId,
      userId: user.id,
      userName: user.name
    })
  }, [socket, user])

  const stopTyping = useCallback((roomId: string) => {
    if (!socket || !user) return

    socket.emit('typing_stop', {
      roomId,
      userId: user.id
    })
  }, [socket, user])

  const markAsRead = useCallback((roomId: string, messageId: string) => {
    if (!socket || !user) return

    socket.emit('mark_as_read', {
      roomId,
      messageId,
      userId: user.id
    })
  }, [socket, user])

  return {
    socket,
    isConnected,
    sendMessage,
    joinRoom,
    startTyping,
    stopTyping,
    markAsRead
  }
}
