import { aircraftDataLifetime, aircraftPrefix, streamKey } from './config'

import { redis, RedisClient } from './redis-client'

type StreamMessage = {
  id: string
  message: {
    [x: string]: string
  }
}

type StreamEvent = {
  name: string
  messages: StreamMessage[]
}

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

export type AircraftStatusHandler = (aircraft: AircraftStatus) => Promise<void>

export class AircraftEventConsumer {
  private redis: RedisClient
  private handlers: Set<AircraftStatusHandler> = new Set()

  static async create() {
    const clonedRedis = await redis
      .duplicate()
      .on('error', err => console.log('Redis Client Error', err))
      .connect()

    return new AircraftEventConsumer(clonedRedis)
  }

  private constructor(redis: RedisClient) {
    this.redis = redis
  }

  registerHandler(handler: AircraftStatusHandler) {
    this.handlers.add(handler)
  }

  unregisterHandler(handler: AircraftStatusHandler) {
    this.handlers.delete(handler)
  }

  async start() {
    // start with recent events
    let currentId = '$'

    // process events forever
    while (true) {
      const event = await this.fetchNextEvent(currentId)
      if (event) {
        const aircraft = this.buildAircraft(event)
        this.handlers.forEach(handler => handler(aircraft))
        currentId = this.extractId(event)
      }
    }
  }

  private async fetchNextEvent(id: string): Promise<StreamEvent | null> {
    const readStream = { key: streamKey, id }
    const options = { BLOCK: 1000, COUNT: 1 }
    const events = await this.redis.xRead(readStream, options)

    return events === null || events.length === 0 ? null : (events[0] as StreamEvent)
  }

  extractId(event: StreamEvent): string {
    const { id } = event.messages[0] as StreamMessage
    return id
  }

  buildAircraft(event: StreamEvent): AircraftStatus {
    // get the message from the event
    const { message } = event.messages[0] as StreamMessage

    // create the minimum viable object to return
    const aircraft: AircraftStatus = {
      icaoId: message.icaoId as string,
      dateTime: Number(message.loggedDateTime),
      radio: message.radio as string
    }

    // set fields if they are available
    if (message.callsign !== undefined) aircraft.callsign = message.callsign
    if (message.altitude !== undefined) aircraft.altitude = Number(message.altitude)
    if (message.latitude !== undefined) aircraft.latitude = Number(message.latitude)
    if (message.longitude !== undefined) aircraft.longitude = Number(message.longitude)
    if (message.velocity !== undefined) aircraft.velocity = Number(message.velocity)
    if (message.heading !== undefined) aircraft.heading = Number(message.heading)
    if (message.climb !== undefined) aircraft.climb = Number(message.climb)
    if (message.onGround !== undefined) aircraft.onGround = message.onGround === 'true'

    // set the location for geo searches
    if (message.latitude !== undefined && message.longitude !== undefined) {
      aircraft.location = `${message.longitude},${message.latitude}`
    }

    // return the object
    return aircraft
  }
}
