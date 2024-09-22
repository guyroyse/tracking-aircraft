import { writable } from 'svelte/store'

type CurrentPosition = {
  latitude: number
  longitude: number
  zoom: number
}

type HomePosition = {
  latitude: number
  longitude: number
  error: string | null
  loading: boolean
}

const currentPosition: CurrentPosition = {
  latitude: 0,
  longitude: 0,
  zoom: 8
}

const homePosition: HomePosition = {
  latitude: 0,
  longitude: 0,
  error: null,
  loading: true
}

const homePositionStore = writable(homePosition)
const currentPositionStore = writable(currentPosition)

navigator.geolocation.getCurrentPosition(processGeolocationSuccess, processGeolocationError)

function updateCurrentPosition(latitude: number, longitude: number, zoom: number) {
  const roundedLatitude = roundDegree(latitude)
  const roundedLongitude = roundDegree(longitude)
  currentPositionStore.set({ latitude: roundedLatitude, longitude: roundedLongitude, zoom })
}

function processGeolocationSuccess(geolocationPosition: GeolocationPosition) {
  const latitude = roundDegree(geolocationPosition.coords.latitude)
  const longitude = roundDegree(geolocationPosition.coords.longitude)
  currentPositionStore.set({ ...currentPosition, latitude, longitude })
  homePositionStore.set({ latitude, longitude, error: null, loading: false })
}

function processGeolocationError(error: GeolocationPositionError) {
  homePositionStore.set({ ...homePosition, error: translateError(error), loading: false })
}

function translateError(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'User denied the request for Geolocation.'
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable.'
    case error.TIMEOUT:
      return 'The request to get user location timed out.'
    default:
      return 'An unknown error occurred.'
  }
}

function roundDegree(value: number) {
  return Math.round(value * 10000) / 10000
}

export { homePositionStore, currentPositionStore, updateCurrentPosition }
