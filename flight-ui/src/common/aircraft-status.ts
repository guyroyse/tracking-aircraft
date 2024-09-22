import { AIRCRAFT_IDLE_TIME } from '../config'

export class AircraftStatus {
  icaoId: string
  lastUpdated: number
  callsign: string | null = null
  radio: string | null = null
  latitude: number | null = null
  longitude: number | null = null
  altitude: number | null = null
  heading: number | null = null
  velocity: number | null = null
  climb: number | null = null

  private constructor(icaoId: string) {
    this.icaoId = icaoId
    this.lastUpdated = new Date().getTime()
  }

  static fromJSON(json: string): AircraftStatus {
    const { icaoId, callsign, radio, latitude, longitude, altitude, heading, velocity, climb } = JSON.parse(json)
    const aircraftStatus = new AircraftStatus(icaoId)
    aircraftStatus.callsign = callsign ?? null
    aircraftStatus.radio = radio ?? null
    aircraftStatus.latitude = latitude ?? null
    aircraftStatus.longitude = longitude ?? null
    aircraftStatus.altitude = altitude ?? null
    aircraftStatus.heading = heading ?? null
    aircraftStatus.velocity = velocity ?? null
    aircraftStatus.climb = climb ?? null

    return aircraftStatus
  }

  merge(that: AircraftStatus) {
    this.lastUpdated = that.lastUpdated
    this.callsign = that.callsign ?? this.callsign
    this.radio = that.radio ?? this.radio
    this.latitude = that.latitude ?? this.latitude
    this.longitude = that.longitude ?? this.longitude
    this.altitude = that.altitude ?? this.altitude
    this.heading = that.heading ?? this.heading
    this.velocity = that.velocity ?? this.velocity
    this.climb = that.climb ?? this.climb
  }

  get displayCallsign(): string {
    return this.callsign ?? 'unknown'
  }

  get displayLocation(): string {
    return this.latitude === null || this.longitude === null
      ? 'unknown'
      : `${this.displayLatitude},${this.displayLongitude}`
  }

  get displayLatitude(): string {
    return this.latitude === null ? 'unknown' : `${this.latitude.toFixed(4)}`
  }

  get displayLongitude(): string {
    return this.longitude === null ? 'unknown' : `${this.longitude.toFixed(4)}`
  }

  get displayAltitude(): string {
    return this.altitude === null ? 'unknown' : `${this.altitude.toLocaleString()} ft`
  }

  get displayHeading(): string {
    return this.heading === null ? 'unknown' : `${this.heading} deg`
  }

  get displayVelocity(): string {
    return this.velocity === null ? 'unknown' : `${this.velocity} kn`
  }

  get displayClimb(): string {
    return this.climb === null ? 'unknown' : `${this.climb} ft`
  }

  get displayLastUpdatedTime(): string {
    const lastUpdated = new Date(this.lastUpdated)
    return lastUpdated.toLocaleTimeString()
  }

  get latlng(): [number, number] | null {
    return this.latitude === null || this.longitude === null ? null : [this.latitude, this.longitude]
  }

  get location(): string | null {
    return this.latlng?.join(',') ?? null
  }

  get isExpired(): boolean {
    const now = new Date().getTime()
    return now - this.lastUpdated > AIRCRAFT_IDLE_TIME
  }
}
