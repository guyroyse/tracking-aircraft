import express from 'express'

/* import routers */
import { router as flightRouter } from './routers/flight-router.js'
import { router as searchRouter } from './routers/search-router.js'

export function startServer() {

  /* create an express app and use JSON */
  const app = new express()
  app.use(express.json())

  /* bring in some routers */
  app.use('/flight', flightRouter)
  app.use('/flights', searchRouter)

  /* start the server */
  app.listen(8888)

}

