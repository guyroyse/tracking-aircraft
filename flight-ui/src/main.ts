import { FLIGHT_SERVER_WS } from './_config'

import 'leaflet/dist/leaflet.css'

import { AircraftStatus } from './aircraft-status'
import { AircraftMap } from './aircraft-map'

// map and icons
const aircraftMap = AircraftMap.create('map')

// add our current location and center the view there
navigator.geolocation.getCurrentPosition(position => {
  const { latitude, longitude } = position.coords
  aircraftMap.centerView(latitude, longitude)
  aircraftMap.addHome(latitude, longitude)
})

// set up aircraft garbage collection
setInterval(() => aircraftMap.removeExpiredMarkers(), 5000)

// set up our event source and handle the events
let ws = new WebSocket(FLIGHT_SERVER_WS)
ws.onopen = _event => {
  ws.onmessage = event => {
    const aircraftStatus = AircraftStatus.fromJSON(event.data)
    aircraftMap.addUpdatePlane(aircraftStatus)
  }
}
