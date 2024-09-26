import { writable } from 'svelte/store'

type HomePosition = {
  latitude: number
  longitude: number
}

type CurrentPosition = {
  latitude: number
  longitude: number
  zoom: number
}

const homePosition: HomePosition = {
  latitude: 0,
  longitude: 0
}

const currentPosition: CurrentPosition = {
  latitude: 0,
  longitude: 0,
  zoom: 8
}

const homePositionStore = writable(homePosition)
const currentPositionStore = writable(currentPosition)

function updateHomePosition(incomingLatitude: number, incomingLongitude: number) {
  const latitude = roundDegree(incomingLatitude)
  const longitude = roundDegree(incomingLongitude)
  homePositionStore.set({ latitude, longitude })
}

function updateCurrentPosition(incomingLatitude: number, incomingLongitude: number, zoom: number = 8) {
  const latitude = roundDegree(incomingLatitude)
  const longitude = roundDegree(incomingLongitude)
  currentPositionStore.set({ latitude, longitude, zoom })
}

function roundDegree(value: number) {
  return Math.round(value * 10000) / 10000
}

export type { HomePosition, CurrentPosition }
export { homePositionStore, currentPositionStore, updateHomePosition, updateCurrentPosition }
