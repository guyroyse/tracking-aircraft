import 'dotenv/config'

/* Redis connection options */
export const REDIS_HOST: string = process.env['REDIS_HOST'] ?? 'localhost'
export const REDIS_PORT: number = Number(process.env['REDIS_PORT'] ?? 6379)
export const REDIS_PASSWORD: string | undefined = process.env['REDIS_PASSWORD']

/* event stream */
export const AIRCRAFT_STREAM_KEY: string = process.env['AIRCRAFT_STREAM_KEY'] ?? 'radio:events'
export const AIRCRAFT_STREAM_BATCH_SIZE: number = Number(process.env['AIRCRAFT_STREAM_BATCH_SIZE'] ?? 100)
export const AIRCRAFT_STREAM_BLOCK_TIMEOUT: number = Number(process.env['AIRCRAFT_STREAM_BLOCK_TIMEOUT'] ?? 1000)

/* TTL for aircraft status */
export const AIRCRAFT_STATUS_TTL: number = Number(process.env['AIRCRAFT_STATUS_TTL'] ?? 3600)

/* flight server options */
export const FLIGHT_SERVER_PORT: number = Number(process.env['FLIGHT_SERVER_PORT'] ?? 8080)

/* Keys and prefixes */
export const AIRCRAFT_STATUS_PREFIX: string = 'aircraft'
export const AIRCRAFT_STATUS_INDEX: string = `${AIRCRAFT_STATUS_PREFIX}:index`
export const ALTITUDE_DIGEST: string = `${AIRCRAFT_STATUS_PREFIX}:altitude`
export const VELOCITY_DIGEST: string = `${AIRCRAFT_STATUS_PREFIX}:velocity`
export const CLIMB_DIGEST: string = `${AIRCRAFT_STATUS_PREFIX}:climb`
export const AIRCRAFT_HLL: string = `${AIRCRAFT_STATUS_PREFIX}:count`
export const MESSAGE_COUNT: string = `${AIRCRAFT_STATUS_PREFIX}:message:count`
