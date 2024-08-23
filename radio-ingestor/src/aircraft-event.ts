export type AircraftEvent = {
  radio: string
  icaoId: string
  type: string
  generatedDateTime: string
  loggedDateTime: string
  callsign?: string
  altitude?: string
  latitude?: string
  longitude?: string
  velocity?: string
  heading?: string
  climb?: string
  onGround?: string
}
