import { readable } from 'svelte/store'

type Position = {
  latitude: number
  longitude: number
  error: string | null
  loading: boolean
}

export const location = readable(
  {
    latitude: 0,
    longitude: 0,
    error: '',
    loading: true
  } as Position,
  set => {
    navigator.geolocation.getCurrentPosition(
      currentPosition => {
        const { latitude, longitude } = currentPosition.coords
        set({ latitude, longitude, error: null, loading: false })
      },
      error => {
        const errorMessage = processError(error)
        console.log(errorMessage)
        set({ latitude: 0, longitude: 0, error: errorMessage, loading: false })
      }
    )
  }
)

function processError(error: GeolocationPositionError) {
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
