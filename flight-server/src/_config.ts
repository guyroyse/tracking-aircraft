import 'dotenv/config'

/* Redis connection options */
export const REDIS_HOST: string = process.env['REDIS_HOST'] ?? 'localhost'
export const REDIS_PORT: number = Number(process.env['REDIS_PORT'] ?? 6379)
export const REDIS_PASSWORD: string | undefined = process.env['REDIS_PASSWORD']

/* keys and indexes */
export const AIRCRAFT_STATUS_TTL: number = Number(process.env['AIRCRAFT_STATUS_TTL'] ?? 3600)
export const AIRCRAFT_STATUS_PREFIX: string = process.env['AIRCRAFT_PREFIX'] ?? 'aircraft:'
export const AIRCRAFT_STATUS_INDEX: string = process.env['AIRCRAFT_INDEX'] ?? `${AIRCRAFT_STATUS_PREFIX}:index`
export const AIRCRAFT_STREAM_KEY: string = process.env['AIRCRAFT_STREAM_KEY'] ?? 'radio:events'

/* flight server options */
export const FLIGHT_SERVER_PORT: number = Number(process.env['FLIGHT_SERVER_PORT'] ?? 8080)
