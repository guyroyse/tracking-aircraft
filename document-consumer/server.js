import 'dotenv/config'

import { aircraftRepository } from './om/aircraft-status.js'
import { redisClient } from './om/client.js'

// get the key with all the flight data in it
const aggregateStreamKey = process.env['AGGREGATE_STREAM_KEY'] ?? 'radio:all'

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

  // fetch the aircraft
  let aircraft = await aircraftRepository.search()
    .where('icacoId').equals(event.icacoId)
      .return.first()

  // if we get nothing, we need to create it
  aircraft = aircraft ?? aircraftRepository.createEntity()

  // if the event has new data, update it
  if (eventIsNewerThanAircraftStatus(event, aircraft)) {

    // set the easy stuff
    aircraft.icacoId = event.icacoId
    aircraft.type = event.type
    aircraft.generatedDateTime = Number(event.generatedDateTime)
    aircraft.loggedDateTime = Number(event.loggedDateTime)
    aircraft.radio = event.radio

    // set the optional stuff
    if (event.callsign !== undefined) aircraft.callsign = event.callsign
    if (event.altitude !== undefined) aircraft.altitude = Number(event.altitude)
    if (event.latitude !== undefined) aircraft.latitude = Number(event.latitude)
    if (event.longitude !== undefined) aircraft.longitude = Number(event.longitude)
    if (event.velocity !== undefined) aircraft.velocity = Number(event.velocity)
    if (event.heading !== undefined) aircraft.heading = Number(event.heading)
    if (event.climb !== undefined) aircraft.climb = Number(event.climb)
    if (event.onGround !== undefined) aircraft.onGround = event.onGround === 'true'

    // set the location for geo searches
    if (aircraft.latitude !== null && aircraft.longitude !== null) {
      aircraft.location = { latitude: aircraft.latitude, longitude: aircraft.longitude }
    }

    // log so it looks like stuff is happening
    console.log(aircraft.entityId)

    // and save
    await aircraftRepository.save(aircraft)
  }

}

function eventIsNewerThanAircraftStatus(event, aircraft) {
  if (aircraft.loggedDateTime === null) return true
  return Number(event.loggedDateTime) > aircraft.loggedDateTime.getTime()
}