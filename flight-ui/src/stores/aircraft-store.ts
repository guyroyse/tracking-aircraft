import { readable } from 'svelte/store'

import { FLIGHT_SERVER_WS } from '@/config'
import { AircraftStatus } from '@/aircraft-status'

let aircraft: Map<string, AircraftStatus> = new Map()
let intervalHandle: number

const aircraftStore = readable(aircraft, set => {
  const ws = new WebSocket(FLIGHT_SERVER_WS)

  ws.onmessage = event => {
    const receivedStatus = AircraftStatus.fromJSON(event.data)
    const foundStatus = aircraft.get(receivedStatus.icaoId)
    if (foundStatus) {
      foundStatus.merge(receivedStatus)
    } else {
      console.log(new Date().toTimeString(), `Adding new aircraft ${receivedStatus.icaoId}`)
      aircraft.set(receivedStatus.icaoId, receivedStatus)
    }

    set(new Map(aircraft))
  }

  intervalHandle = setInterval(() => {
    let aircraftRemoved = false
    for (const [icaoId, status] of aircraft) {
      if (status.isExpired) {
        console.log(new Date().toTimeString(), `Removing expired aircraft ${icaoId}`)
        aircraft.delete(icaoId)
        aircraftRemoved = true
      }
    }

    if (aircraftRemoved) set(new Map(aircraft))
  }, 5000)

  return () => {
    ws.close()
    clearInterval(intervalHandle)
  }
})

export { aircraftStore }
