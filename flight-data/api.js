import express from 'express'
import cors from 'cors'

/* import routers */
import { router as flightRouter } from './routers/flight-router.js'
import { router as searchRouter } from './routers/search-router.js'

export function startServer() {

  /* create an express app and set it up to be excessively permissive */
  const app = new express()
  app.use(express.json())
  app.use(cors())
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  })

  /* bring in some routers */
  app.use('/flight', flightRouter)
  app.use('/flights', searchRouter)

  /* start the server */
  app.listen(80)

}

