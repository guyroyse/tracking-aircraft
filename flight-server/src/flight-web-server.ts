import { FLIGHT_SERVER_PORT } from './config'

import cors from 'cors'
import express, { Express, Router } from 'express'
import { Server as HTTP_Server } from 'http'

import { router as aircraftAPI_Router } from './aircraft-api-router'

export class FlightWebServer {
  private app: Express
  private httpServer: HTTP_Server | undefined

  private constructor(app: Express) {
    this.app = app
  }

  static create(): FlightWebServer {
    const app = express()
    return new FlightWebServer(app).enableJSON().enableCORS().bindRoutes('/aircraft', aircraftAPI_Router)
  }

  private enableJSON(): FlightWebServer {
    this.app.use(express.json())
    return this
  }

  private enableCORS(): FlightWebServer {
    this.app.use(cors())
    this.app.use(function (_req, res, next) {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      next()
    })
    return this
  }

  private bindRoutes(path: string, router: Router): FlightWebServer {
    this.app.use(path, router)
    return this
  }

  start() {
    this.httpServer = this.app.listen(FLIGHT_SERVER_PORT)
    return this
  }

  get server(): HTTP_Server {
    return this.httpServer ?? this.start().server
  }
}
