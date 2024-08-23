import { AIRCRAFT_STATUS_INDEX } from './config'

import { Router } from 'express'
import { SearchReply } from 'redis'

import { redis } from './redis-client'

export const router = Router()

router.get('/', async (_req, res) => {
  const result = await redis.ft.search(AIRCRAFT_STATUS_INDEX, '*')
  const aircraft = convertMultipleResult(result)
  res.send(aircraft)
})

router.get('/icao/:id', async (req, res) => {
  const { id } = req.params
  const result = await redis.ft.search(AIRCRAFT_STATUS_INDEX, `@icaoId:{${id}}`)
  const aircraft = convertSingleResult(result)
  res.send(aircraft)
})

router.get('/callsign/:callsign', async (req, res) => {
  const { callsign } = req.params
  const result = await redis.ft.search(AIRCRAFT_STATUS_INDEX, `@callsign:{${callsign}}`)
  const aircraft = convertMultipleResult(result)
  res.send(aircraft)
})

router.get('/above/:altitude', async (req, res) => {
  const { altitude } = req.params
  const result = await redis.ft.search(AIRCRAFT_STATUS_INDEX, `@altitude:[${altitude} +inf]`)
  const aircraft = convertMultipleResult(result)
  res.send(aircraft)
})

router.get('/heading/:direction', async (req, res) => {
  const { direction } = req.params

  let query = '*'
  if (direction === 'north') query = ` @heading:[315 360] @heading:[0 45]`
  if (direction === 'east') query = `@heading:[45 135]`
  if (direction === 'south') query = `@heading:[135 225]`
  if (direction === 'west') query = `@heading:[225 315]`

  const result = await redis.ft.search(AIRCRAFT_STATUS_INDEX, query)
  const aircraft = convertMultipleResult(result)
  res.send(aircraft)
})

router.get('/within/:radius/:units/of/:longitude/:latitude', async (req, res) => {
  const { longitude, latitude, radius, units } = req.params
  const result = await redis.ft.search(AIRCRAFT_STATUS_INDEX, `@location:[${longitude} ${latitude} ${radius} ${units}]`)
  const aircraft = convertMultipleResult(result)
  res.send(aircraft)
})

function convertSingleResult(result: SearchReply) {
  const [document] = result.documents
  const value = document ? document.value : {}
  console.log(value)
  return value
}

function convertMultipleResult(result: SearchReply) {
  return result.documents.map(document => {
    console.log(document.value)
    return document.value
  })
}
