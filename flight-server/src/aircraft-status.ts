export type AircraftStatus = {
  icaoId: string
  dateTime: number
  radio: string
  callsign?: string
  altitude?: number
  altitudePercentile?: number
  latitude?: number
  longitude?: number
  location?: string
  heading?: number
  velocity?: number
  velocityPercentile?: number
  climb?: number
  climbPercentile?: number
  onGround?: boolean
}

export type AircraftStatusHandler = (aircraft: AircraftStatus) => Promise<void>
