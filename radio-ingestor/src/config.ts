import 'dotenv/config'

export const sbs1Host: string = process.env['SBS1_SOURCE_HOST'] ?? 'localhost'
export const sbs1Port: number = Number(process.env['SBS1_SOURCE_PORT'] ?? 30003)

export const redisHost: string = process.env['REDIS_HOST'] ?? 'localhost'
export const redisPort: number = Number(process.env['REDIS_PORT'] ?? 6379)
export const redisPassword: string | undefined = process.env['REDIS_PASSWORD']

export const streamKey: string = process.env['STREAM_KEY'] ?? 'radio:events'
export const streamLifetime: number = Number(process.env['STREAM_LIFETIME'] ?? 3600)

export const radioId: string = process.env['RADIO_ID'] ?? 'radio:unknown'
