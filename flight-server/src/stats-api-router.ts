import { ALTITUDE_DIGEST, VELOCITY_DIGEST, CLIMB_DIGEST, AIRCRAFT_HLL, MESSAGE_COUNT } from './_config'

import { Router } from 'express'

import { redis } from './redis-client'

type Quantiles = {
  mean: number
  median: number
  p90: number
  p95: number
  p99: number
}

export const router = Router()

router.get('/', async (_req, res) => {
  const aircraftSpotted = await redis.pfCount(AIRCRAFT_HLL)
  const messagesReceived = await redis.get(MESSAGE_COUNT)
  const altitudeQuantiles: Quantiles = await fetchQuantiles(ALTITUDE_DIGEST)
  const velocityQuantiles: Quantiles = await fetchQuantiles(VELOCITY_DIGEST)
  const climbQuantiles: Quantiles = await fetchQuantiles(CLIMB_DIGEST)

  res.send({
    aircraftSpotted,
    messagesReceived,
    altitude: altitudeQuantiles,
    velocity: velocityQuantiles,
    climb: climbQuantiles
  })
})

async function fetchQuantiles(key: string) {
  const quantiles = await redis.tDigest.quantile(key, [0.5, 0.9, 0.95, 0.99])
  const mean = await redis.tDigest.trimmedMean(key, 0, 1)
  return convertQuantiles(mean, quantiles)
}

function convertQuantiles(mean: number, quantiles: number[]): Quantiles {
  const [median, p90, p95, p99] = quantiles
  return {
    mean,
    median: median ?? 0,
    p90: p90 ?? 0,
    p95: p95 ?? 0,
    p99: p99 ?? 0
  }
}
