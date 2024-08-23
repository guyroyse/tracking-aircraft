import { Server as HTTP_Server } from 'http'
import WebSocket, { WebSocketServer } from 'ws'

export class FlightWebSockerServer {
  private webServer: HTTP_Server
  private webSocketServer: WebSocketServer

  readonly sockets: Set<WebSocket> = new Set()

  private constructor(webServer: HTTP_Server) {
    this.webServer = webServer
    this.webSocketServer = new WebSocketServer({ noServer: true, path: '/events' })
  }

  static create(webServer: HTTP_Server): FlightWebSockerServer {
    return new FlightWebSockerServer(webServer).bindUpgrade().bindConnection()
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
}
