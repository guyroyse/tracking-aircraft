import 'dotenv/config'

/* SBS1 source options */
export const SBS1_HOST: string = process.env['SBS1_HOST'] ?? 'localhost'
export const SBS1_PORT: number = Number(process.env['SBS1_PORT'] ?? 30003)

/* Redis connection options */
export const REDIS_HOST: string = process.env['REDIS_HOST'] ?? 'localhost'
export const REDIS_PORT: number = Number(process.env['REDIS_PORT'] ?? 6379)
export const REDIS_PASSWORD: string | undefined = process.env['REDIS_PASSWORD']

export const AIRCRAFT_STREAM_KEY: string = process.env['AIRCRAFT_STREAM_KEY'] ?? 'radio:events'
export const AIRCRAFT_STREAM_LIEFTIME: number = Number(process.env['AIRCRAFT_STREAM_LIEFTIME'] ?? 3600)

export const RADIO_ID: string = process.env['RADIO_ID'] ?? 'radio:unknown'
