import 'dotenv/config'
import * as sbs1 from 'sbs1'
import * as redis from 'redis'

const host = process.env['DUMP_1090_HOST']
const port = Number(process.env['DUMP_1090_PORT'])
const streamKey = process.env['STREAM_KEY']

const sbs1Client = sbs1.createClient({ host, port })
const redisClient = redis.createClient()

redisClient.on('error', (err) => console.log('Redis Client Error', err))
await redisClient.connect()

sbs1Client.on('message', msg => {
  const aircraftId = msg.hex_ident
  const minId = new Date().getTime() - 30 * 60 * 1000
  const trimOptions = {
    strategy: 'MINID',
    strategyModifier: '~',
    threshold: minId
  }

  redisClient.xAdd(streamKey, '*', msg, { TRIM: trimOptions })
  redisClient.xAdd(`${streamKey}:${aircraftId}`, '*', msg)
  redisClient.sAdd(`${streamKey}:aircraft`, aircraftId)
})
