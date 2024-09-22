import { ICON_IDLE_TIME } from '../config'

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

  get latlng(): [number, number] | null {
    return this.latitude === null || this.longitude === null ? null : [this.latitude, this.longitude]
  }

  get location(): string | null {
    return this.latlng?.join(',') ?? null
  }

  get isExpired(): boolean {
    const now = new Date().getTime()
    return now - this.lastUpdated > ICON_IDLE_TIME
  }
}
