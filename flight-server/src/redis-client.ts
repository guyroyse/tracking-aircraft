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
  .on('ready', () => console.log('Redis client is ready'))
  .connect()

await waitForRedis()

await dropIndex()
await createIndex()

/* Drop the aircraft index if it exists. */
async function dropIndex(): Promise<void> {
  try {
    await redis.ft.dropIndex(AIRCRAFT_STATUS_INDEX)
  } catch (error) {
    console.log('Error dropping index (this is expected if index does not exist):', error)
  }
}

/* Create the aircraft index. */
async function createIndex(): Promise<void> {
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
}

/* Determine if Redis is done loading or not. */
async function isReady(): Promise<boolean> {
  const info = await redis.info('persistence')
  const lines = info.split('\r\n')
  const loadingLine = lines.find(line => line.startsWith('loading:'))
  const loadingValue = loadingLine?.split(':')[1]
  return loadingValue === '0'
}

/* Wait for Redis to finish loading. */
async function waitForRedis() {
  let loaded = false

  while (!loaded) {
    loaded = await isReady()
    if (!loaded) console.log("Redis is loading...")
  }

  console.log("Redis is ready!")
}
