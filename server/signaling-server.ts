import { Server } from 'socket.io'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  // Store active rooms and their participants
  const rooms = new Map<string, Set<string>>()

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-room', (roomId: string) => {
      console.log(`Client ${socket.id} joining room ${roomId}`)
      socket.join(roomId)

      // Add socket to room
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set())
      }
      rooms.get(roomId)?.add(socket.id)

      // Notify others in the room
      socket.to(roomId).emit('user-joined', socket.id)
    })

    socket.on('offer', ({ offer, roomId }) => {
      console.log(`Offer from ${socket.id} in room ${roomId}`)
      socket.to(roomId).emit('offer', offer)
    })

    socket.on('answer', ({ answer, roomId }) => {
      console.log(`Answer from ${socket.id} in room ${roomId}`)
      socket.to(roomId).emit('answer', answer)
    })

    socket.on('ice-candidate', ({ candidate, roomId }) => {
      console.log(`ICE candidate from ${socket.id} in room ${roomId}`)
      socket.to(roomId).emit('ice-candidate', candidate)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)

      // Remove socket from all rooms
      rooms.forEach((participants, roomId) => {
        if (participants.has(socket.id)) {
          participants.delete(socket.id)
          socket.to(roomId).emit('user-left', socket.id)

          // Clean up empty rooms
          if (participants.size === 0) {
            rooms.delete(roomId)
          }
        }
      })
    })
  })

  const port = process.env.SIGNALING_SERVER_PORT || 3001
  server.listen(port, () => {
    console.log(`> Signaling server ready on http://localhost:${port}`)
  })
}) 