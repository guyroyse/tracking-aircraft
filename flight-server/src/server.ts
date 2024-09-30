import {
  AIRCRAFT_STATUS_TTL,
  AIRCRAFT_STATUS_PREFIX,
  ALTITUDE_DIGEST,
  VELOCITY_DIGEST,
  CLIMB_DIGEST,
  AIRCRAFT_HLL,
  MESSAGE_COUNT
} from './_config'

import { AircraftEventConsumer } from './aircraft-event-consumer'
import { FlightWebServer } from './flight-web-server'
import { FlightWebSockerServer } from './flight-web-socket-server'
import { redis } from './redis-client'

const webServer = FlightWebServer.create().start()
const webSockerServer = FlightWebSockerServer.create(webServer.server)
const consumer = await AircraftEventConsumer.create()

/* Set up data structures for aircraft data. */
createTDigest(ALTITUDE_DIGEST)
createTDigest(VELOCITY_DIGEST)
createTDigest(CLIMB_DIGEST)
resetCounter(AIRCRAFT_HLL)
resetCounter(MESSAGE_COUNT)

/* Update Redis with the current aircraft data. */
consumer.registerHandler(async aircraft => {
  const { icaoId, altitude, velocity, climb } = aircraft
  const key = `${AIRCRAFT_STATUS_PREFIX}:${icaoId}`

  // Merge the current aircraft data with the existing data.
  redis.json.merge(key, '$', aircraft)

  // Reset the TTL for the aircraft data.
  redis.expire(key, AIRCRAFT_STATUS_TTL)

  // Update the T-Digests with the current aircraft data.
  if (altitude) redis.tDigest.add(ALTITUDE_DIGEST, [altitude])
  if (velocity) redis.tDigest.add(VELOCITY_DIGEST, [velocity])
  if (climb) redis.tDigest.add(CLIMB_DIGEST, [climb])

  // Update the HyperLogLog with the current aircraft data.
  redis.pfAdd(AIRCRAFT_HLL, icaoId)

  // Increment the message count.
  redis.incr(MESSAGE_COUNT)
})

/* Send the current aircraft data to the connected clients. */
consumer.registerHandler(async aircraft => {
  // Enrich the aircraft data with percentiles.
  const { altitude, velocity, climb } = aircraft
  if (altitude) aircraft.altitudePercentile = await fetchPercentile(ALTITUDE_DIGEST, altitude)
  if (velocity) aircraft.velocityPercentile = await fetchPercentile(VELOCITY_DIGEST, velocity)
  if (climb) aircraft.climbPercentile = await fetchPercentile(CLIMB_DIGEST, climb)

  // Send the aircraft data to the connected clients.
  const json = JSON.stringify(aircraft)
  webSockerServer.sockets.forEach(s => s.send(json))
})

consumer.start()

async function createTDigest(key: string) {
  const exists = await redis.exists(key)
  if (exists) {
    redis.tDigest.reset(key)
  } else {
    redis.tDigest.create(key)
  }
}

function resetCounter(key: string) {
  redis.unlink(key)
}

async function fetchPercentile(key: string, value: number): Promise<number> {
  const values = await redis.tDigest.cdf(key, [value])
  return Math.floor((values[0] ?? 0) * 100)
}
