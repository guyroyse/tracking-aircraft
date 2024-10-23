import { Server as HTTP_Server } from 'http'
import WebSocket, { WebSocketServer } from 'ws'
import { AircraftStatus } from './aircraft-status'

export class FlightWebSocketServer {
  private webServer: HTTP_Server
  private webSocketServer: WebSocketServer
  private batchedAircraft: Record<string, AircraftStatus> = {}

  readonly sockets: Set<WebSocket> = new Set()

  private constructor(webServer: HTTP_Server) {
    this.webServer = webServer
    this.webSocketServer = new WebSocketServer({ noServer: true, path: '/events' })
  }

  static create(webServer: HTTP_Server): FlightWebSocketServer {
    return new FlightWebSocketServer(webServer).bindUpgrade().bindConnection().startTimer()
  }

  private bindUpgrade() {
    this.webServer.on('upgrade', (req, socket, head) => {
      this.webSocketServer.handleUpgrade(req, socket, head, ws => {
        this.webSocketServer.emit('connection', ws, req)
      })
    })

    return this
  }

  private bindConnection() {
    this.webSocketServer.on('connection', socket => {
      this.sockets.add(socket)
      socket.on('close', () => this.sockets.delete(socket))
    })

    return this
  }

  private startTimer() {
    setInterval(() => {
      console.log(`Sending ${Object.keys(this.batchedAircraft).length} batched aircraft`)
      for (const icaoId in this.batchedAircraft) {
        const data = this.batchedAircraft[icaoId]
        const json = JSON.stringify(data)
        this.sockets.forEach(socket => socket.send(json))
      }
      this.batchedAircraft = {}
    }, 1000)

    return this
  }

  private mergeAircaftData(found: AircraftStatus, received: AircraftStatus): AircraftStatus {
    return { ...found, ...received }
  }

  public sendAircraftStatus(received: AircraftStatus) {
    const found = this.batchedAircraft[received.icaoId]
    const merged = found ? this.mergeAircaftData(found, received) : received
    this.batchedAircraft[merged.icaoId] = merged
  }
}
