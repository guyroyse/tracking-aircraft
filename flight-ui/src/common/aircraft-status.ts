import { AIRCRAFT_IDLE_TIME } from '../config'

export type AircraftStatusData = {
  icaoId: string
  lastUpdated: number
  callsign: string | null
  radio: string | null
  latitude: number | null
  longitude: number | null
  altitude: number | null
  heading: number | null
  velocity: number | null
  climb: number | null
}

export const AircraftStatus = {
  fromJSON: function (json: string): AircraftStatusData {
    const { icaoId, callsign, radio, latitude, longitude, altitude, heading, velocity, climb } = JSON.parse(json)

    const status: AircraftStatusData = {
      icaoId,
      lastUpdated: new Date().getTime(),
      callsign: callsign ?? null,
      radio: radio ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      altitude: altitude ?? null,
      heading: heading ?? null,
      velocity: velocity ?? null,
      climb: climb ?? null
    }

    return status
  },

  merge: function (found: AircraftStatusData, received: AircraftStatusData): AircraftStatusData {
    return {
      icaoId: received.icaoId,
      lastUpdated: received.lastUpdated,
      callsign: received.callsign ?? found.callsign,
      radio: received.radio ?? found.radio,
      latitude: received.latitude ?? found.latitude,
      longitude: received.longitude ?? found.longitude,
      altitude: received.altitude ?? found.altitude,
      heading: received.heading ?? found.heading,
      velocity: received.velocity ?? found.velocity,
      climb: received.climb ?? found.climb
    }
  },

  displayCallsign: function (status: AircraftStatusData): string {
    return status.callsign ?? 'unknown'
  },

  displayLocation: function (status: AircraftStatusData): string {
    return status.latitude === null || status.longitude === null
      ? 'unknown'
      : `${this.displayLatitude(status)},${this.displayLongitude(status)}`
  },

  displayLatitude: function (status: AircraftStatusData): string {
    return status.latitude === null ? 'unknown' : `${status.latitude.toFixed(4)}`
  },

  displayLongitude: function (status: AircraftStatusData): string {
    return status.longitude === null ? 'unknown' : `${status.longitude.toFixed(4)}`
  },

  displayAltitude: function (status: AircraftStatusData): string {
    return status.altitude === null ? 'unknown' : `${status.altitude.toLocaleString()} ft`
  },

  displayHeading: function (status: AircraftStatusData): string {
    return status.heading === null ? 'unknown' : `${status.heading} deg`
  },

  displayVelocity: function (status: AircraftStatusData): string {
    return status.velocity === null ? 'unknown' : `${status.velocity} kn`
  },

  displayClimb: function (status: AircraftStatusData): string {
    return status.climb === null ? 'unknown' : `${status.climb} ft`
  },

  displayLastUpdatedTime: function (status: AircraftStatusData): string {
    const lastUpdated = new Date(status.lastUpdated)
    return lastUpdated.toLocaleTimeString()
  },

  linkIcao: function (status: AircraftStatusData): string {
    const url = `#/aircraft/${status.icaoId}`
    return `<a class="hover:underline hover:text-redis-deep-hyper text-redis-dusk-90" href="${url}">${status.icaoId}</a>`
  },

  linkCallsign: function (status: AircraftStatusData): string {
    if (!status.callsign) return 'unknown'
    const url = `https://flightaware.com/live/flight/${status.callsign}`
    const link = `<a class="hover:underline hover:text-redis-deep-hyper text-redis-dusk-90" href="${url}" target="_new">${status.callsign}</a>`
    return link
  },

  latlng: function (status: AircraftStatusData): [number, number] | null {
    return status.latitude === null || status.longitude === null ? null : [status.latitude, status.longitude]
  },

  location: function (status: AircraftStatusData): string | null {
    return this.latlng(status)?.join(',') ?? null
  },

  isExpired: function (status: AircraftStatusData): boolean {
    const now = new Date().getTime()
    return now - status.lastUpdated > AIRCRAFT_IDLE_TIME
  }
}
