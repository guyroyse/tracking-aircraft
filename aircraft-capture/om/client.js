import * as redis from 'redis'
import { Client } from 'redis-om'

const redisHost = process.env['REDIS_HOST'] ?? 'localhost'
const redisPort = Number(process.env['REDIS_PORT'] ?? 6379)
const redisPassword = process.env['REDIS_PASSWORD']

// connect to Redis
export const redisClient = redis.createClient({
  socket: { host: redisHost, port: redisPort },
  password: redisPassword })

redisClient.on('error', (err) => console.log('Redis Client Error', err))
await redisClient.connect()

// connect to Redis OM
export const omClient = await new Client().use(redisClient)
