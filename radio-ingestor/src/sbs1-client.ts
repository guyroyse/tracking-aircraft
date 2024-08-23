import { RADIO_ID, SBS1_HOST, SBS1_PORT } from './_config'

import { createClient, Client, SBS1_Message, TransmissionType } from 'sbs1'

import { AircraftEvent } from './aircraft-event'

export type SBS1_EventHandler = (event: AircraftEvent) => Promise<void>

export class SBS1_Client {
  private client: Client
  private handlers: Set<SBS1_EventHandler> = new Set()

  constructor(sbs1Client: Client) {
    this.client = sbs1Client
  }

  static create() {
    const client = createClient({ host: SBS1_HOST, port: SBS1_PORT })
    return new SBS1_Client(client).bindMessage()
  }

  registerHandler(handler: SBS1_EventHandler) {
    this.handlers.add(handler)
    return this
  }

  unregisterHandler(handler: SBS1_EventHandler) {
    this.handlers.delete(handler)
    return this
  }

  private bindMessage() {
    this.client.on('message', async message => {
      if (message.message_type === null) return
      const event = this.buildAircraftEvent(message)
      this.handlers.forEach(handler => handler(event))
    })

    return this
  }

  private buildAircraftEvent(sbs1Message: SBS1_Message): AircraftEvent {
    const event: AircraftEvent = {
      radio: RADIO_ID,
      icaoId: sbs1Message.hex_ident,
      type: this.toTransmissionType(sbs1Message.transmission_type),
      generatedDateTime: this.toEpochMilliseconds(sbs1Message.generated_date, sbs1Message.generated_time).toString(),
      loggedDateTime: this.toEpochMilliseconds(sbs1Message.logged_date, sbs1Message.logged_time).toString()
    }

    if (sbs1Message.callsign !== null) event.callsign = sbs1Message.callsign.trim()
    if (sbs1Message.altitude !== null) event.altitude = sbs1Message.altitude.toString()
    if (sbs1Message.lat !== null) event.latitude = sbs1Message.lat.toString()
    if (sbs1Message.lon !== null) event.longitude = sbs1Message.lon.toString()
    if (sbs1Message.ground_speed !== null) event.velocity = sbs1Message.ground_speed.toString()
    if (sbs1Message.track !== null) event.heading = sbs1Message.track.toString()
    if (sbs1Message.vertical_rate !== null) event.climb = sbs1Message.vertical_rate.toString()
    if (sbs1Message.is_on_ground !== null) event.onGround = sbs1Message.is_on_ground.toString()

    return event
  }

  private toEpochMilliseconds(dateString: string, timeString: string): number {
    if (!dateString || !timeString) return 0

    const offset = new Date().getTimezoneOffset() * 60 * 1000
    const date = new Date(`${dateString.replaceAll('/', '-')}T${timeString}`)
    return date.getTime() - offset
  }

  private toTransmissionType(type: TransmissionType): string {
    return (
      [
        'ES_IDENT_AND_CATEGORY',
        'ES_SURFACE_POS',
        'ES_AIRBORNE_POS',
        'ES_AIRBORNE_VEL',
        'SURVEILLANCE_ALT',
        'SURVEILLANCE_ID',
        'AIR_TO_AIR',
        'ALL_CALL_REPLY'
      ][type - 1] ?? 'UNKNOWN'
    )
  }
}
