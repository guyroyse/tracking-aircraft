export type AircraftStatus = {
  icaoId: string
  dateTime: number
  radio: string
  callsign?: string
  altitude?: number
  latitude?: number
  longitude?: number
  location?: string
  velocity?: number
  heading?: number
  climb?: number
  onGround?: boolean
}
