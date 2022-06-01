import { Router } from 'express'

import { flightRepository } from '../om/flight.js'

export const router = Router()

router.get('/', async (req, res) => {
  /* fetch all flights */
  const flights = await flightRepository.search().return.all()

  /* return the flights */
  res.send(flights)
})

router.get('/by-radio/:radio', async (req, res) => {
  /* fetch the matching flights */
  const flights = await flightRepository.search()
    .where('radio').equals(req.params.radio)
      .return.all()

  /* return the flights */
  res.send(flights)
})

router.get('/above/:altitude', async (req, res) => {
  /* fetch the matching flights */
  const flights = await flightRepository.search()
    .where('altitude').gte(Number(req.params.altitude))
      .return.all()

  /* return the flights */
  res.send(flights)
})

router.get('/below/:altitude', async (req, res) => {
  /* fetch the matching flights */
  const flights = await flightRepository.search()
    .where('altitude').lte(Number(req.params.altitude))
      .return.all()

  /* return the flights */
  res.send(flights)
})

router.get('/heading/north', async (req, res) => {
  /* fetch the matching flights */
  const flights = await flightRepository.search()
    .where('heading').between(0, 45)
      .or('heading').between(315, 360)
        .return.all()

  /* return the flights */
  res.send(flights)
})
