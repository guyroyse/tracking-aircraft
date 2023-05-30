import * as redis from 'redis'
import { SchemaFieldTypes } from 'redis'

const redisHost = process.env['REDIS_HOST'] ?? 'localhost'
const redisPort = Number(process.env['REDIS_PORT'] ?? 6379)
const redisPassword = process.env['REDIS_PASSWORD']

// connect to Redis
export const redisClient = redis.createClient({
  socket: { host: redisHost, port: redisPort },
  password: redisPassword
})

redisClient.on('error', (err) => console.log('Redis Client Error', err))
await redisClient.connect()

// export the index name
export const aircraftIndex = 'aircraft:index'

// drop the index if it exists
try {
  await redisClient.ft.dropIndex(aircraftIndex)
} catch (error) {
  if (error.message !== 'Unknown Index name') throw error
}

// create the RediSearch index
await redisClient.ft.create(aircraftIndex, {
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
}, {
  ON: 'JSON',
  PREFIX: 'aircraft:'
})
