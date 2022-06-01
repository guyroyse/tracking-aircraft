import 'dotenv/config'


import { startConsumer } from './consumer.js'
import { startServer } from './api.js'

startConsumer()
startServer()
