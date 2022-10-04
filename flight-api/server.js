import 'dotenv/config'

import express from 'express'
import cors from 'cors'

/* import the router */
import { router } from './router.js'

/* create an express app and set it up to be excessively permissive */
const app = new express()
app.use(express.json())
app.use(cors())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

/* bind the router */
app.use('/aircraft', router)

/* start the server */
app.listen(80)
