import { writable } from 'svelte/store'

import { AircraftStatus } from '../common/aircraft-status'
import type { AircraftStatusData } from '../common/aircraft-status'

export type AircraftStatuses = {
  [icaoId: string]: AircraftStatusData
}

const aircraftStatuses: AircraftStatuses = {}
const aircraftStore = writable(aircraftStatuses)

function addOrUpdateAircraft(receivedStatus: AircraftStatusData) {
  aircraftStore.update(aircraftStatuses => {
    const foundStatus = aircraftStatuses[receivedStatus.icaoId]
    const newStatus = foundStatus ? AircraftStatus.merge(foundStatus, receivedStatus) : receivedStatus
    aircraftStatuses[newStatus.icaoId] = newStatus
    return aircraftStatuses
  })
}

function removeAircraft(icaoId: string) {
  aircraftStore.update(aircraftStatuses => {
    console.log(new Date().toTimeString(), `Removing aircraft ${icaoId}`)
    delete aircraftStatuses[icaoId]
    return aircraftStatuses
  })
}

function removeExpiredAircraft() {
  for (const icaoId in aircraftStatuses) {
    const status = aircraftStatuses[icaoId] as AircraftStatusData
    if (AircraftStatus.isExpired(status)) {
      console.log(new Date().toTimeString(), `Expired aircraft found ${icaoId}`)
      removeAircraft(icaoId)
    }
  }
}

export { aircraftStore, addOrUpdateAircraft, removeAircraft, removeExpiredAircraft }
