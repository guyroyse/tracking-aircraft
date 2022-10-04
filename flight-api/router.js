import { Router } from 'express'

import { aircraftIndex, redisClient } from './redis.js'

export const router = Router()

router.get('/', async (req, res) => {
  const result = await redisClient.ft.search(aircraftIndex, '*')
  const aircraft = convertMultipleResult(result)
  res.send(aircraft)
})

router.get('/icao/:id', async (req, res) => {
  const { id } = req.params
  const result = await redisClient.ft.search(aircraftIndex,
    `@icaoId:{${id}}`)
  const aircraft = convertSingleResult(result)
  res.send(aircraft)
})

router.get('/callsign/:callsign', async (req, res) => {
  const { callsign } = req.params
  const result = await redisClient.ft.search(aircraftIndex,
    `@callsign:{${callsign}}`)
  const aircraft = convertMultipleResult(result)
  res.send(aircraft)
})

router.get('/above/:altitude', async (req, res) => {
  const { altitude } = req.params
  const result = await redisClient.ft.search(aircraftIndex,
    `@altitude:[${altitude} +inf]`)
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

  const result = await redisClient.ft.search(aircraftIndex, query)
  const aircraft = convertMultipleResult(result)
  res.send(aircraft)
})

router.get('/within/:radius/:units/of/:longitude/:latitude', async (req, res) => {
  const { longitude, latitude, radius, units } = req.params
  const result = await redisClient.ft.search(aircraftIndex,
    `@location:[${longitude} ${latitude} ${radius} ${units}]`)
  const aircraft = convertMultipleResult(result)
  res.send(aircraft)
})

function convertSingleResult(result) {
  const [ document ] = result.documents
  if (document) return convertDocument(document)
  return null
}

function convertMultipleResult(result) {
  return result.documents.map(document => convertDocument(document))
}

function convertDocument(document) {
  // get the value
  const data = document.value

  // create the aircraft to return
  const aircraft = {}

  // set the always stuff
  aircraft.icaoId = data.icaoId,
  aircraft.dateTime = Number(data.dateTime),
  aircraft.radio = data.radio

  // set the sometimes stuff
  if (data.callsign !== undefined) aircraft.callsign = data.callsign
  if (data.altitude !== undefined) aircraft.altitude = Number(data.altitude)
  if (data.latitude !== undefined) aircraft.latitude = Number(data.latitude)
  if (data.longitude !== undefined) aircraft.longitude = Number(data.longitude)
  if (data.velocity !== undefined) aircraft.velocity = Number(data.velocity)
  if (data.heading !== undefined) aircraft.heading = Number(data.heading)
  if (data.climb !== undefined) aircraft.climb = Number(data.climb)
  if (data.onGround !== undefined) aircraft.onGround = data.onGround === 'true'

  // return it
  return aircraft
}
