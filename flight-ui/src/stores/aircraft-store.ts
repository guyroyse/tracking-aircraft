import { writable } from 'svelte/store'

import { AircraftStatus } from '../common/aircraft-status'

const aircraftStatuses: Map<string, AircraftStatus> = new Map()
const aircraftStore = writable(aircraftStatuses)

function addOrUpdateAircraft(receivedStatus: AircraftStatus) {
  aircraftStore.update(aircraftStatuses => {
    /* Look for the aircraft in question. */
    const foundStatus = aircraftStatuses.get(receivedStatus.icaoId)

    if (foundStatus) {
      /* If found, merge the received status with the existing status. */
      foundStatus.merge(receivedStatus)
    } else {
      /* Otherwise, add the new status. */
      console.log(new Date().toTimeString(), `Adding new aircraft ${receivedStatus.icaoId}`)
      aircraftStatuses.set(receivedStatus.icaoId, receivedStatus)
    }

    /* Return the updated statuses. */
    return aircraftStatuses
  })
}

function removeAircraft(icaoId: string) {
  aircraftStore.update(aircraftStatuses => {
    console.log(new Date().toTimeString(), `Removing aircraft ${icaoId}`)
    aircraftStatuses.delete(icaoId)
    return aircraftStatuses
  })
}

function removeExpiredAircraft() {
  for (const [icaoId, status] of aircraftStatuses) {
    if (status.isExpired) {
      console.log(new Date().toTimeString(), `Expired aircraft found ${icaoId}`)
      removeAircraft(icaoId)
    }
  }
}

export { aircraftStore, addOrUpdateAircraft, removeAircraft, removeExpiredAircraft }
