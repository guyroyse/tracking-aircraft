declare module 'sbs1' {
  import { EventEmitter } from 'events'

  export type ClientOptions = {
    host: string
    port: number
  }

  export enum MessageType {
    SELECTION_CHANGE = 'SEL',
    NEW_ID = 'ID',
    NEW_AIRCRAFT = 'AIR',
    STATUS_CHANGE = 'STA',
    CLICK = 'CLK',
    TRANSMISSION = 'MSG'
  }

  export enum TransmissionType {
    ES_IDENT_AND_CATEGORY = 1,
    ES_SURFACE_POS = 2,
    ES_AIRBORNE_POS = 3,
    ES_AIRBORNE_VEL = 4,
    SURVEILLANCE_ALT = 5,
    SURVEILLANCE_ID = 6,
    AIR_TO_AIR = 7,
    ALL_CALL_REPLY = 8
  }

  export type SBS1_Message = {
    message_type: MessageType | null
    transmission_type: TransmissionType
    hex_ident: string
    generated_date: string
    generated_time: string
    logged_date: string
    logged_time: string
    callsign: string | null
    altitude: number | null
    lat: number | null
    lon: number | null
    ground_speed: number | null
    track: number | null
    vertical_rate: number | null
    is_on_ground: boolean | null
  }

  export type ClientEvents = {
    message: [message: SBS1_Message]
    error: [error: Error]
    close: []
  }

  class Client extends EventEmitter<ClientEvents> {
    constructor(options: ClientOptions)
  }

  export function createClient(options: ClientOptions): Client
}
