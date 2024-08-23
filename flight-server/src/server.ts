import { aircraftDataLifetime, aircraftPrefix, flightServerPort } from './config'

import express from 'express'
import http from 'http'
import cors from 'cors'
import WebSocket, { WebSocketServer } from 'ws'

import { AircraftEventConsumer } from './consumer'
import { redis } from './redis-client'
import { router } from './router.js'

/* create an express app */
const app = express()

/* set it up for JSON */
app.use(express.json())

/* set it up to be excessively permissive */
app.use(cors())
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

/* bind the router */
app.use('/aircraft', router)

const server = app.listen(flightServerPort)

/* bind the websocket server */
const wss = new WebSocketServer({ noServer: true, path: '/ws' })
server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req))
})

const sockets: Set<WebSocket> = new Set()

wss.on('connection', socket => {
  sockets.add(socket)
  socket.on('close', () => sockets.delete(socket))
})

const consumer = await AircraftEventConsumer.create()

consumer.registerHandler(async aircraft => {
  const key = `${aircraftPrefix}${aircraft.icaoId}`
  redis.json.merge(key, '$', aircraft)
  redis.expire(key, aircraftDataLifetime)
})

consumer.registerHandler(async aircraft => {
  const json = JSON.stringify(aircraft)
  sockets.forEach(s => s.send(json))
})

consumer.start()
