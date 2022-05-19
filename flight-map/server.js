import 'dotenv/config'

import * as redis from 'redis'
import express from 'express'

const redisHost = process.env['REDIS_HOST'] ?? 'localhost'
const redisPort = Number(process.env['REDIS_PORT'] ?? 6379)
const redisPassword = process.env['REDIS_PASSWORD']


const streamKey = process.env['STREAM_KEY']

const redisClient = redis.createClient({
  socket: { host: redisHost, port: redisPort },
  password: redisPassword })

redisClient.on('error', (err) => console.log('Redis Client Error', err))
await redisClient.connect()


const app = new express()
app.use(express.json())
app.use(express.static('static'))

app.get('/events/aircraft/all', async (req, res) => {
  res.writeHead(200, {
    'Connection': 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache'
  })

  let currentId = '$'
  while (true) {
    const result = await redisClient.xRead({ key: streamKey, id: currentId }, { BLOCK: 5000, COUNT: 1 })

    if (!result) continue

    const { id, message } = result[0].messages[0]
    currentId = id

    res.write(`id: ${id}\n`)
    res.write(`data: ${JSON.stringify(message)}\n`)
    res.write(`\n`)
  }
})

app.listen(8080)
