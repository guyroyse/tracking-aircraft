import { writable } from 'svelte/store'

type Percentiles = {
  mean: number
  median: number
  p90: number
  p95: number
  p99: number
}

type AircraftStats = {
  aircraftSpotted: number
  messagesReceived: number
  altitude: Percentiles
  velocity: Percentiles
  climb: Percentiles
}

const stats: AircraftStats = {
  aircraftSpotted: 0,
  messagesReceived: 0,
  altitude: {
    mean: 0,
    median: 0,
    p90: 0,
    p95: 0,
    p99: 0
  },
  velocity: {
    mean: 0,
    median: 0,
    p90: 0,
    p95: 0,
    p99: 0
  },
  climb: {
    mean: 0,
    median: 0,
    p90: 0,
    p95: 0,
    p99: 0
  }
}

const statsStore = writable(stats)

function updateStats(stats: AircraftStats) {
  statsStore.set(stats)
}

export type { AircraftStats }
export { statsStore, updateStats }
