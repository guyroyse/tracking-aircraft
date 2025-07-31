import { AIRCRAFT_STREAM_BATCH_SIZE, AIRCRAFT_STREAM_BLOCK_TIMEOUT, AIRCRAFT_STREAM_KEY } from './_config'

import { AircraftStatus, AircraftStatusHandler } from './aircraft-status'
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

  registerHandler(handler: AircraftStatusHandler): void {
    this.handlers.add(handler)
  }

  unregisterHandler(handler: AircraftStatusHandler): void {
    this.handlers.delete(handler)
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


        yield event

        currentId = this.extractId(event)
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
