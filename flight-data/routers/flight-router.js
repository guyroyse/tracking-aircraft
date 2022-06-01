import { Router } from 'express'

import { flightRepository } from '../om/flight.js'

export const router = Router()

router.get('/icao/:id', async (req, res) => {
  /* fetch the Flight */
  const flight = await flightRepository.search()
    .where('icaoId').equals(req.params.id)
      .return.first()

  /* return the fetched Flight */
  res.send(flight)
})

router.get('/callsign/:callsign', async (req, res) => {
  /* fetch the Flight */
  const flight = await flightRepository.search()
    .where('callsign').equals(req.params.callsign)
      .return.first()

  /* return the fetched Flight */
  res.send(flight)
})
