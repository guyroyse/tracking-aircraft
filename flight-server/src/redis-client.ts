import { AIRCRAFT_STATUS_INDEX, AIRCRAFT_STATUS_PREFIX, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from './_config.js'

import { createClient, ErrorReply, SchemaFieldTypes } from 'redis'

/* Redis connection options */
const redisOptions = {
  socket: { host: REDIS_HOST, port: REDIS_PORT },
  password: REDIS_PASSWORD
}

/* helper type for others */
export type RedisClient = ReturnType<typeof createClient>

/* connect to Redis */
export const redis: RedisClient = await createClient(redisOptions)
  .on('error', err => console.log('Redis Client Error', err))
  .connect()

/* drop aircraft index if it exists */
try {
  await redis.ft.dropIndex(AIRCRAFT_STATUS_INDEX)
} catch (error) {
  if (error instanceof ErrorReply && error.message !== 'Unknown Index name') throw error
}

/* create the aircraft index */
await redis.ft.create(
  AIRCRAFT_STATUS_INDEX,
  {
    '$.radio': { type: SchemaFieldTypes.TAG, AS: 'radio' },
    '$.icaoId': { type: SchemaFieldTypes.TAG, AS: 'icaoId' },
    '$.dateTime': { type: SchemaFieldTypes.NUMERIC, AS: 'dateTime' },
    '$.callsign': { type: SchemaFieldTypes.TAG, AS: 'callsign' },
    '$.altitude': { type: SchemaFieldTypes.NUMERIC, AS: 'altitude' },
    '$.latitude': { type: SchemaFieldTypes.NUMERIC, AS: 'latitude' },
    '$.longitude': { type: SchemaFieldTypes.NUMERIC, AS: 'longitude' },
    '$.location': { type: SchemaFieldTypes.GEO, AS: 'location' },
    '$.velocity': { type: SchemaFieldTypes.NUMERIC, AS: 'velocity' },
    '$.heading': { type: SchemaFieldTypes.NUMERIC, AS: 'heading' },
    '$.climb': { type: SchemaFieldTypes.NUMERIC, AS: 'climb' },
    '$.onGround': { type: SchemaFieldTypes.TAG, AS: 'onGround' }
  },
  {
    ON: 'JSON',
    PREFIX: AIRCRAFT_STATUS_PREFIX
  }
)
