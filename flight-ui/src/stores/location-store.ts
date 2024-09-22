import { readable } from 'svelte/store'

type Position = {
  latitude: number
  longitude: number
  error: string | null
  loading: boolean
}

const position = { latitude: 0, longitude: 0, error: null, loading: true } as Position

const locationStore = readable(position, set => {
  navigator.geolocation.getCurrentPosition(
    currentPosition => {
      processCurrentPosition(currentPosition)
      console.log(position)
      set(position)
    },
    error => {
      processError(error)
      console.log(position.error)
      set(position)
    }
  )
})

function processCurrentPosition(currentPosition: GeolocationPosition) {
  const { latitude, longitude } = currentPosition.coords
  position.latitude = latitude
  position.longitude = longitude
  position.loading = false
}

function processError(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      position.error = 'User denied the request for Geolocation.'
      break
    case error.POSITION_UNAVAILABLE:
      position.error = 'Location information is unavailable.'
      break
    case error.TIMEOUT:
      position.error = 'The request to get user location timed out.'
      break
    default:
      position.error = 'An unknown error occurred.'
  }

  position.loading = false
}

export { locationStore }
