import { writable } from 'svelte/store'

import { FLIGHT_SERVER_WS } from '../config'

import { AircraftStatus } from '../common/aircraft-status'

type AircraftStatuses = Map<string, AircraftStatus>

const aircraftStatuses: AircraftStatuses = new Map()
const aircraftStore = writable(aircraftStatuses)

/* Handle incoming aircraft transponder events. */
let ws: WebSocket = new WebSocket(FLIGHT_SERVER_WS)
ws.onmessage = processEvent

/* Set up the timer to expire aircraft we haven't heard from in a while. */
setInterval(expireAircraft, 5000)

function processEvent(event: MessageEvent) {
  const receivedStatus = AircraftStatus.fromJSON(event.data)
  const foundStatus = aircraftStatuses.get(receivedStatus.icaoId)

  /* If found, merge the received status with the existing status. Otherwise, add the new status. */
  if (foundStatus) {
    foundStatus.merge(receivedStatus)
  } else {
    console.log(new Date().toTimeString(), `Adding new aircraft ${receivedStatus.icaoId}`)
    aircraftStatuses.set(receivedStatus.icaoId, receivedStatus)
  }

  aircraftStore.set(aircraftStatuses)
}

function expireAircraft() {
  let aircraftRemoved = false

  for (const [icaoId, status] of aircraftStatuses) {
    if (status.isExpired) {
      console.log(new Date().toTimeString(), `Removing expired aircraft ${icaoId}`)
      aircraftStatuses.delete(icaoId)
      aircraftRemoved = true
    }
  }

  if (aircraftRemoved) aircraftStore.set(aircraftStatuses)
}

export { aircraftStore }
