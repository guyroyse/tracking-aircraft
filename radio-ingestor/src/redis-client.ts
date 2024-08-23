import { redisHost, redisPassword, redisPort } from './config.js'

import { createClient } from 'redis'

const redisOptions = {
  socket: { host: redisHost, port: redisPort },
  password: redisPassword
}

export const redis = await createClient(redisOptions)
  .on('error', err => console.log('Redis Client Error', err))
  .connect()
