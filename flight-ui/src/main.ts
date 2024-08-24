import { FLIGHT_SERVER_WS } from './_config'

import 'leaflet/dist/leaflet.css'

import { AircraftStatus } from './aircraft-status'
import { AircraftMap } from './aircraft-map'

import { Menu } from './menu'

/* set up the menu */
const menu = Menu.create()
menu.bind('map-nav', 'map')
menu.bind('list-nav', 'list')
menu.bind('search-nav', 'search')
menu.start()

/* create the map */
const aircraftMap = AircraftMap.create('map')

/* add current location and center the view there */
navigator.geolocation.getCurrentPosition(position => {
  const { latitude, longitude } = position.coords
  aircraftMap.centerView(latitude, longitude)
  aircraftMap.addHome(latitude, longitude)
})

/* remove old aircraft garbage collection */
setInterval(() => aircraftMap.removeExpiredMarkers(), 5000)

/* listen for incoming aircraft events */
let ws = new WebSocket(FLIGHT_SERVER_WS)
ws.onopen = _event => {
  ws.onmessage = event => {
    const aircraftStatus = AircraftStatus.fromJSON(event.data)
    aircraftMap.addUpdatePlane(aircraftStatus)
  }
}
