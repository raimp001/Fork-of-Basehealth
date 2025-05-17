import { io, Socket } from 'socket.io-client'

interface WebRTCConfig {
  iceServers: RTCIceServer[]
  signalingServerUrl: string
}

const defaultConfig: WebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  signalingServerUrl: process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || 'http://localhost:3001',
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private socket: Socket
  private roomId: string
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null

  constructor(roomId: string, config: Partial<WebRTCConfig> = {}) {
    const finalConfig = { ...defaultConfig, ...config }
    this.roomId = roomId
    this.peerConnection = new RTCPeerConnection({ iceServers: finalConfig.iceServers })
    this.socket = io(finalConfig.signalingServerUrl)

    this.setupSocketListeners()
    this.setupPeerConnectionListeners()
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to signaling server')
      this.socket.emit('join-room', this.roomId)
    })

    this.socket.on('offer', async (offer: RTCSessionDescriptionInit) => {
      await this.handleOffer(offer)
    })

    this.socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
      await this.handleAnswer(answer)
    })

    this.socket.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
      await this.handleIceCandidate(candidate)
    })
  }

  private setupPeerConnectionListeners() {
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          candidate: event.candidate,
          roomId: this.roomId,
        })
      }
    }

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0]
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(this.remoteStream)
      }
    }
  }

  async startLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      this.localStream.getTracks().forEach((track) => {
        if (this.localStream) {
          this.peerConnection.addTrack(track, this.localStream)
        }
      })
      return this.localStream
    } catch (error) {
      console.error('Error accessing media devices:', error)
      throw error
    }
  }

  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      this.socket.emit('offer', {
        offer,
        roomId: this.roomId,
      })
    } catch (error) {
      console.error('Error creating offer:', error)
      throw error
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(answer)
      this.socket.emit('answer', {
        answer,
        roomId: this.roomId,
      })
    } catch (error) {
      console.error('Error handling offer:', error)
      throw error
    }
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    } catch (error) {
      console.error('Error handling answer:', error)
      throw error
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (error) {
      console.error('Error handling ICE candidate:', error)
      throw error
    }
  }

  onRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback
  }

  async toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  async toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  disconnect() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
    }
    this.peerConnection.close()
    this.socket.disconnect()
  }
} 