import { AIRCRAFT_IDLE_TIME } from '../config'

export type AircraftStatusData = {
  icaoId: string
  dateTime: number
  lastUpdated: number
  callsign: string | null
  radio: string | null
  latitude: number | null
  longitude: number | null
  heading: number | null
  altitude: number | null
  altitudePercentile: number | null
  velocity: number | null
  velocityPercentile: number | null
  climb: number | null
  climbPercentile: number | null
}

export const AircraftStatus = {
  fromJSON: function (json: string): AircraftStatusData {
    const {
      icaoId,
      dateTime,
      callsign,
      radio,
      latitude,
      longitude,
      heading,
      altitude,
      altitudePercentile,
      velocity,
      velocityPercentile,
      climb,
      climbPercentile
    } = JSON.parse(json)

    const status: AircraftStatusData = {
      icaoId,
      dateTime,
      lastUpdated: new Date().getTime(),
      callsign: callsign ?? null,
      radio: radio ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      heading: heading ?? null,
      altitude: altitude ?? null,
      altitudePercentile: altitudePercentile ?? null,
      velocity: velocity ?? null,
      velocityPercentile: velocityPercentile ?? null,
      climb: climb ?? null,
      climbPercentile: climbPercentile ?? null
    }

    return status
  },

  merge: function (found: AircraftStatusData, received: AircraftStatusData): AircraftStatusData {
    return {
      icaoId: received.icaoId,
      dateTime: received.dateTime,
      lastUpdated: received.lastUpdated,
      callsign: received.callsign ?? found.callsign,
      radio: received.radio ?? found.radio,
      latitude: received.latitude ?? found.latitude,
      longitude: received.longitude ?? found.longitude,
      heading: received.heading ?? found.heading,
      altitude: received.altitude ?? found.altitude,
      altitudePercentile: received.altitudePercentile ?? found.altitudePercentile,
      velocity: received.velocity ?? found.velocity,
      velocityPercentile: received.velocityPercentile ?? found.velocityPercentile,
      climb: received.climb ?? found.climb,
      climbPercentile: received.climbPercentile ?? found.climbPercentile
    }
  },

  hasChanged: function (a: AircraftStatusData, b: AircraftStatusData): boolean {
    if (a.callsign !== b.callsign) return true
    if (a.latitude !== b.latitude) return true
    if (a.longitude !== b.longitude) return true
    if (a.heading !== b.heading) return true
    if (a.altitude !== b.altitude) return true
    if (a.velocity !== b.velocity) return true
    if (a.climb !== b.climb) return true
    return false
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

  displayHeading: function (status: AircraftStatusData): string {
    return status.heading === null ? 'unknown' : `${status.heading} deg`
  },

  displayAltitude: function (status: AircraftStatusData): string {
    return status.altitude === null ? 'unknown' : `${status.altitude.toLocaleString()} ft`
  },

  displayAltitudePercentile: function (status: AircraftStatusData): string {
    return this.displayPercentile(status.altitudePercentile)
  },

  displayVelocity: function (status: AircraftStatusData): string {
    return status.velocity === null ? 'unknown' : `${status.velocity} kn`
  },

  displayVelocityPercentile: function (status: AircraftStatusData): string {
    return this.displayPercentile(status.velocityPercentile)
  },

  displayClimb: function (status: AircraftStatusData): string {
    return status.climb === null ? 'unknown' : `${status.climb} ft`
  },

  displayClimbPercentile: function (status: AircraftStatusData): string {
    return this.displayPercentile(status.climbPercentile)
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
  },

  displayNumber: function (n: number | null): string {
    return n === null ? '-' : Math.round(n).toLocaleString()
  },

  displayPercentile: function (percentile: number | null): string {
    if (percentile === null) return '-'
    const s = percentile.toString()
    if (s.endsWith('1')) return `${s}st`
    if (s.endsWith('2')) return `${s}nd`
    if (s.endsWith('3')) return `${s}rd`
    return `${s}th`
  }
}
