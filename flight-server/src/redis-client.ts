import { aircraftIndex, aircraftPrefix, redisHost, redisPassword, redisPort } from './config.js'

import { createClient, ErrorReply, SchemaFieldTypes } from 'redis'

export type RedisClient = ReturnType<typeof createClient>

// connect to Redis
const redisOptions = {
  socket: { host: redisHost, port: redisPort },
  password: redisPassword
}

export const redis: RedisClient = await createClient(redisOptions)
  .on('error', err => console.log('Redis Client Error', err))
  .connect()

// drop the index if it exists
try {
  await redis.ft.dropIndex(aircraftIndex)
} catch (error) {
  if (error instanceof ErrorReply && error.message !== 'Unknown Index name') throw error
}

// create the RediSearch index
await redis.ft.create(
  aircraftIndex,
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
    PREFIX: aircraftPrefix
  }
)
