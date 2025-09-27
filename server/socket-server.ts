import { createServer } from 'http'
import { Server } from 'socket.io'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

interface User {
  id: string
  socketId: string
  name: string
  role: string
}

interface Message {
  id: string
  roomId: string
  senderId: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file'
  status: 'sent' | 'delivered' | 'read'
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

  // Store connected users
  const connectedUsers = new Map<string, User>()
  const userRooms = new Map<string, Set<string>>()

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id)

    // Handle user authentication
    socket.on('authenticate', (userData: { userId: string, name: string, role: string }) => {
      const user: User = {
        id: userData.userId,
        socketId: socket.id,
        name: userData.name,
        role: userData.role
      }
      
      connectedUsers.set(userData.userId, user)
      socket.emit('authenticated', { success: true })
      
      // Notify others that user is online
      socket.broadcast.emit('user_online', userData.userId)
    })

    // Handle joining chat rooms
    socket.on('join_room', (roomId: string, userId: string) => {
      socket.join(roomId)
      
      if (!userRooms.has(userId)) {
        userRooms.set(userId, new Set())
      }
      userRooms.get(userId)!.add(roomId)
      
      // Notify others in room
      socket.to(roomId).emit('user_joined', { roomId, userId })
    })

    // Handle sending messages
    socket.on('send_message', (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => {
      const fullMessage: Message = {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date(),
        status: 'sent'
      }
      
      // Send to all users in the room
      io.to(message.roomId).emit('new_message', fullMessage)
      
      // Update status to delivered for other users
      setTimeout(() => {
        fullMessage.status = 'delivered'
        socket.to(message.roomId).emit('message_status_update', {
          messageId: fullMessage.id,
          status: 'delivered'
        })
      }, 100)
    })

    // Handle typing indicators
    socket.on('typing_start', ({ roomId, userId, userName }) => {
      socket.to(roomId).emit('user_typing', { userId, userName })
    })

    socket.on('typing_stop', ({ roomId, userId }) => {
      socket.to(roomId).emit('user_stopped_typing', { userId })
    })

    // Handle message read receipts
    socket.on('mark_as_read', ({ roomId, messageId, userId }) => {
      socket.to(roomId).emit('message_read', { messageId, userId })
    })

    // Handle video/voice calls
    socket.on('call_user', ({ targetUserId, signalData, callType }) => {
      const targetUser = connectedUsers.get(targetUserId)
      if (targetUser) {
        io.to(targetUser.socketId).emit('incoming_call', {
          from: socket.id,
          signalData,
          callType
        })
      }
    })

    socket.on('answer_call', ({ to, signalData }) => {
      io.to(to).emit('call_accepted', signalData)
    })

    socket.on('end_call', ({ targetUserId }) => {
      const targetUser = connectedUsers.get(targetUserId)
      if (targetUser) {
        io.to(targetUser.socketId).emit('call_ended')
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
      
      // Find and remove user
      let disconnectedUserId: string | null = null
      connectedUsers.forEach((user, userId) => {
        if (user.socketId === socket.id) {
          disconnectedUserId = userId
          connectedUsers.delete(userId)
        }
      })
      
      if (disconnectedUserId) {
        // Notify others that user is offline
        socket.broadcast.emit('user_offline', disconnectedUserId)
        
        // Clean up user rooms
        userRooms.delete(disconnectedUserId)
      }
    })
  })

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log('> Socket.io server running')
  })
})
