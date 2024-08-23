import 'dotenv/config'

export const redisHost: string = process.env['REDIS_HOST'] ?? 'localhost'
export const redisPort: number = Number(process.env['REDIS_PORT'] ?? 6379)
export const redisPassword: string | undefined = process.env['REDIS_PASSWORD']

export const aircraftPrefix: string = process.env['AIRCRAFT_PREFIX'] ?? 'aircraft:'
export const aircraftIndex: string = process.env['AIRCRAFT_INDEX'] ?? `${aircraftPrefix}:index`

export const streamKey: string = process.env['STREAM_KEY'] ?? 'radio:events'
export const aircraftDataLifetime: number = Number(process.env['AIRCRAFT_DATA_LIFETIME'] ?? 3600)

export const flightServerPort: number = Number(process.env['FLIGHT_SERVER_PORT'] ?? 8080)
