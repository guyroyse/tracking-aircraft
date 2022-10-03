import { Router } from 'express'

import { aircraftIndex, redisClient } from './client.js'

export const router = Router()

router.get('/', async (req, res) => {
  const aircraft = await redisClient.ft.search(aircraftIndex, '*')
  res.send(aircraft)
})

router.get('/icao/:id', async (req, res) => {
  const { id } = req.params
  const aircraft = await redisClient.ft.search(aircraftIndex,
    `@icaoId:{${id}}`)
  res.send(aircraft)
})

router.get('/callsign/:callsign', async (req, res) => {
  const { callsign } = req.params
  const aircraft = await redisClient.ft.search(aircraftIndex,
    `@callsign:{${callsign}}`)
  res.send(aircraft)
})

router.get('/above/:altitude', async (req, res) => {
  const { altitude } = req.params
  const aircraft = await redisClient.ft.search(aircraftIndex,
    `@altitude:[${altitude} +inf]`)
  res.send(aircraft)
})

router.get('/heading/:direction', async (req, res) => {
  const { direction } = req.params

  let query = '*'
  if (direction === 'north') query = ` @heading:[315 360] @heading:[0 45]`
  if (direction === 'east') query = `@heading:[45 135]`
  if (direction === 'south') query = `@heading:[135 225]`
  if (direction === 'west') query = `@heading:[225 315]`

  const aircraft = await redisClient.ft.search(aircraftIndex, query)
  res.send(aircraft)
})

router.get('/within/:radius/:units/of/:longitude/:latitude', async (req, res) => {
  const { longitude, latitude, radius, units } = req.params
  const aircraft = await redisClient.ft.search(aircraftIndex,
    `@location:[${longitude} ${latitude} ${radius} ${units}]`)
  res.send(aircraft)
})
