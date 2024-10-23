import { AIRCRAFT_STREAM_BATCH_SIZE, AIRCRAFT_STREAM_BLOCK_TIMEOUT, AIRCRAFT_STREAM_KEY } from './_config'

import { AircraftStatus } from './aircraft-status'
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
    return this
  }

  unregisterHandler(handler: AircraftStatusHandler) {
    this.handlers.delete(handler)
    return this
  }

  async start() {
    for await (const event of this.fetchEvents()) {
      const aircraftStatus = this.buildAircraftStatus(event)
      this.handlers.forEach(handler => handler(aircraftStatus))
    }
  }

  private async *fetchEvents() {
    let currentId = '$'

    while (true) {
      const events = await this.fetchBlockOfEvents(currentId)
      for (const event of events) {
        const icaoId = event.messages[0]?.message.icaoId
        const dateTime = Number(event.messages[0]?.message.loggedDateTime) + 4 * 60 * 60 * 1000
        const dateTimeString = new Date(dateTime).toLocaleTimeString()

        const now = new Date().getTime()
        const nowString = new Date(now).toLocaleTimeString()
        const diff = now - dateTime

        console.log(`ICAO: ${icaoId} Status: ${dateTimeString} Current: ${nowString} Diff: ${diff}ms`)

        yield event

        // HACK
        // This is commented out to prevent the consumer from lagging too far behind the producer. However,
        // this will cause the consumer to miss events if the producer is too fast. As aircraft transponders
        // produce 100s of messages a second, only far away aircraft will be missed. During period of low
        // traffic, the consumer could process the same message multiple times making aircraft sticky.

        // currentId = this.extractId(event)
      }
    }
  }

  private async fetchBlockOfEvents(id: string): Promise<StreamEvent[]> {
    const readStream = { key: AIRCRAFT_STREAM_KEY, id }
    const options = { BLOCK: AIRCRAFT_STREAM_BLOCK_TIMEOUT, COUNT: AIRCRAFT_STREAM_BATCH_SIZE }
    const events = await this.redis.xRead(readStream, options)

    return events ?? []
  }

  private extractId(event: StreamEvent): string {
    const { id } = event.messages[0] as StreamMessage
    return id
  }

  private buildAircraftStatus(event: StreamEvent): AircraftStatus {
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
