import { AIRCRAFT_STATUS_INDEX, AIRCRAFT_STATUS_POLLING_INTERVAL, AIRCRAFT_STATUS_MAX_RESULTS } from './_config'

import { AircraftStatus, AircraftStatusHandler } from './aircraft-status'
import { redis, RedisClient } from './redis-client'

export class AircraftStatusPoller {
  private redis: RedisClient
  private handlers: Set<AircraftStatusHandler> = new Set()
  private intervalId?: NodeJS.Timeout

  static async create() {
    const clonedRedis = await redis
      .duplicate()
      .on('error', err => console.log('Redis Client Error', err))
      .connect()

    return new AircraftStatusPoller(clonedRedis)
  }

  constructor(redis: RedisClient) {
    this.redis = redis
  }

  registerHandler(handler: AircraftStatusHandler): void {
    this.handlers.add(handler)
  }

  unregisterHandler(handler: AircraftStatusHandler): void {
    this.handlers.delete(handler)
  }

  start(): void {
    if (this.intervalId) return
    
    this.intervalId = setInterval(() => {
      this.poll().catch(err => console.error('Polling error:', err))
    }, AIRCRAFT_STATUS_POLLING_INTERVAL)
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }

  private async poll(): Promise<void> {
    const aircraft = await this.fetchAllAircraft()
    for (const aircraftStatus of aircraft) {
      for (const handler of this.handlers) {
        await handler(aircraftStatus)
      }
    }
  }

  private async fetchAllAircraft(): Promise<AircraftStatus[]> {
    try {
      const result = await this.redis.ft.search(AIRCRAFT_STATUS_INDEX, '*', {
        LIMIT: { from: 0, size: AIRCRAFT_STATUS_MAX_RESULTS },
        DIALECT: 2
      })
      return result.documents.map(doc => doc.value as unknown as AircraftStatus)
    } catch (error) {
      console.error('Error fetching aircraft:', error)
      return []
    }
  }
}