import 'dotenv/config'

import * as redis from 'redis'

const redisHost = process.env['REDIS_HOST'] ?? 'localhost'
const redisPort = Number(process.env['REDIS_PORT'] ?? 6379)
const redisPassword = process.env['REDIS_PASSWORD']

const aggregateStreamLifetime = Number(process.env['AGGREGATE_STREAM_LIFETIME'] ?? 3600)
const aggregateStreamKey = process.env['AGGREGATE_STREAM_KEY'] ?? 'radio:all'
const ingestorStreamKeysKey = process.env['INGESTOR_STREAM_KEYS_KEY'] ?? 'radios'

// connect to Redis
const redisClient = redis.createClient({
  socket: { host: redisHost, port: redisPort },
  password: redisPassword })

redisClient.on('error', (err) => console.log('Redis Client Error', err))
await redisClient.connect()

// get the keys for all the ingestor streams from Redis
const streamKeys = await redisClient.sMembers(ingestorStreamKeysKey)

// this gets passed into .xRead to read all the streams
const currentKeysAndIds = streamKeys.map(key => ({ key, id: '$' }))

// read streams forever
while (true) {

  // wait at most a second for results
  const results = await redisClient.xRead(currentKeysAndIds, { BLOCK: 1000, COUNT: 1 }) ?? []

  // we can get a result for each ingestor stream (or none at all if now new events arrived)
  results.forEach(result => {

    // pull the values for the event out of the result
    const { name: streamKey, messages } = result
    const [ { id, message } ] = messages
    const event = { radio: streamKey, ...message }

    // update the current id with the most recently found id so we get the next event
    const index = currentKeysAndIds.findIndex(current => current.key === streamKey)
    currentKeysAndIds[index].id = id

    // log the event so it looks like the service does something
    console.log(event)

    // find oldest event id to keep
    const oldestEventId = new Date().getTime() - aggregateStreamLifetime * 1000

    // add the event to the stream, expiring old events
    redisClient.xAdd(aggregateStreamKey, '*', event, {
      TRIM: {
        strategy: 'MINID',
        strategyModifier: '~',
        threshold: oldestEventId
      }
    })
  })
}
