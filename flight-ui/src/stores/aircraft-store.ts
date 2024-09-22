import { readable } from 'svelte/store'

import { FLIGHT_SERVER_WS } from '../config'
import { AircraftStatus } from '../common/aircraft-status'

const aircraft: Map<string, AircraftStatus> = new Map()
let ws: WebSocket = new WebSocket(FLIGHT_SERVER_WS)
let expireAircraftHandle: number

const aircraftStore = readable(aircraft, set => {
  /* Handle incoming aircraft transponder events. */
  ws.onmessage = event => {
    processEvent(event)
    set(aircraft)
  }

  /* Set up the timer to expire aircraft we haven't heard from in a while. */
  expireAircraftHandle = setInterval(() => {
    const aircraftRemoved = expireAircraft()
    if (aircraftRemoved) set(aircraft)
  }, 5000)

  /* Return the cleanup function. */
  return cleanUp
})

function processEvent(event: MessageEvent) {
  const receivedStatus = AircraftStatus.fromJSON(event.data)
  const foundStatus = aircraft.get(receivedStatus.icaoId)

  /* If found, merge the received status with the existing status. Otherwise, add the new status. */
  if (foundStatus) {
    foundStatus.merge(receivedStatus)
  } else {
    console.log(new Date().toTimeString(), `Adding new aircraft ${receivedStatus.icaoId}`)
    aircraft.set(receivedStatus.icaoId, receivedStatus)
  }
}

function expireAircraft(): boolean {
  let aircraftRemoved = false

  for (const [icaoId, status] of aircraft) {
    if (status.isExpired) {
      console.log(new Date().toTimeString(), `Removing expired aircraft ${icaoId}`)
      aircraft.delete(icaoId)
      aircraftRemoved = true
    }
  }

  return aircraftRemoved
}

function cleanUp() {
  ws.close()
  clearInterval(expireAircraftHandle)
}

export { aircraftStore }
