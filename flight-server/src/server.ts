import { AIRCRAFT_STATUS_TTL, AIRCRAFT_STATUS_PREFIX } from './_config'

import { AircraftEventConsumer } from './aircraft-event-consumer'
import { FlightWebServer } from './flight-web-server'
import { FlightWebSockerServer } from './flight-web-socket-server'
import { redis } from './redis-client'

const webServer = FlightWebServer.create().start()
const webSockerServer = FlightWebSockerServer.create(webServer.server)
const consumer = await AircraftEventConsumer.create()

consumer.registerHandler(async aircraft => {
  const key = `${AIRCRAFT_STATUS_PREFIX}${aircraft.icaoId}`
  redis.json.merge(key, '$', aircraft)
  redis.expire(key, AIRCRAFT_STATUS_TTL)
})

consumer.registerHandler(async aircraft => {
  const json = JSON.stringify(aircraft)
  webSockerServer.sockets.forEach(s => s.send(json))
})

consumer.start()
