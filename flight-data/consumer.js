import { flightRepository } from './om/flight.js'
import { redisClient } from './om/client.js'

const aggregateStreamKey = process.env['AGGREGATE_STREAM_KEY'] ?? 'radio:all'
const flightDataLifetime = Number(process.env['FLIGHT_DATA_LIFETIME'] ?? 3600)

export async function startConsumer() {

  // just start with recent events
  let currentId = '$'

  // check forever
  while (true) {

    // wait at most a second for a result
    const result = await redisClient.xRead({ key: aggregateStreamKey, id: currentId }, { BLOCK: 1000, COUNT: 1 })

    // loop if we have no results
    if (result === null) continue

    // pull the values for the event out of the result
    const [ { messages } ] = result
    const [ { id, message } ] = messages
    const event = { ...message }

    // update the current id so we get the next event next time
    currentId = id

    // fetch the flight
    let flight = await flightRepository.search()
      .where('icaoId').equals(event.icaoId)
        .return.first()

    // if we get nothing, we need to create it
    flight = flight ?? flightRepository.createEntity()

    // if the event has new data, update it
    if (eventIsNewerThanFlight(event, flight)) {

      // set the easy stuff
      flight.icaoId = event.icaoId
      flight.dateTime = Number(event.loggedDateTime)
      flight.radio = event.radio

      // set the optional stuff
      if (event.callsign !== undefined) flight.callsign = event.callsign
      if (event.altitude !== undefined) flight.altitude = Number(event.altitude)
      if (event.latitude !== undefined) flight.latitude = Number(event.latitude)
      if (event.longitude !== undefined) flight.longitude = Number(event.longitude)
      if (event.velocity !== undefined) flight.velocity = Number(event.velocity)
      if (event.heading !== undefined) flight.heading = Number(event.heading)
      if (event.climb !== undefined) flight.climb = Number(event.climb)
      if (event.onGround !== undefined) flight.onGround = event.onGround === 'true'

      // set the location for geo searches
      if (flight.latitude !== null && flight.longitude !== null) {
        flight.location = { latitude: flight.latitude, longitude: flight.longitude }
      }

      // log so it looks like stuff is happening
      console.log(flight.toJSON())

      // and save and set an expiration
      await flightRepository.save(flight)
      await flightRepository.expire(flight.entityId, flightDataLifetime)
    }
  }
}

function eventIsNewerThanFlight(event, flight) {
  if (flight.dateTime === null) return true
  return Number(event.loggedDateTime) > flight.dateTime.getTime()
}
