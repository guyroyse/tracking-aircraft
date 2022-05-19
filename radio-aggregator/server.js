import * as redis from 'redis'

const redisHost = process.env['REDIS_HOST'] ?? 'localhost'
const redisPort = Number(process.env['REDIS_PORT'] ?? 6379)
const redisPassword = process.env['REDIS_PASSWORD']

const ingestorKeys = process.env['INGESTOR_STREAM_KEYS'].split(',')
const aggregatorKey = process.env['AGGREGATOR_STREAM_KEY']


const redisClient = redis.createClient({
  socket: { host: redisHost, port: redisPort },
  password: redisPassword })

redisClient.on('error', (err) => console.log('Redis Client Error', err))
await redisClient.connect()

const currentKeysAndIds = ingestorKeys.map(key => ({ key, id: '$' }))

while (true) {

  const results = await redisClient.xRead(currentKeysAndIds, { BLOCK: 1000, COUNT: 1 })

  if (!results) continue

  results.forEach(result => {
    const key = result.name
    const id = result.messages[0].id
    const message = result.messages[0].message
    message.radio = key

    const index = currentKeysAndIds.findIndex(current => current.key === key)
    currentKeysAndIds[index].id = id

    const thirtyMinutes = 30 * 60 * 1000
    const minId = new Date().getTime() - thirtyMinutes

    redisClient.xAdd(aggregatorKey, '*', message, {
      TRIM: {
        strategy: 'MINID',
        strategyModifier: '~',
        threshold: minId
      }
    })
  })

}

redisClient.quit()

