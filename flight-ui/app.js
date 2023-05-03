const AIRCRAFT_EXPIRATION_TIME = 60 * 1000

// map and icons
const map = L.map('map')
const homeIcon = L.icon({ iconUrl: 'icons/home.png', iconSize: [16, 16] })
const planeIcons = [...Array(24).keys()]
  .map(n => L.icon({ iconUrl: `icons/plane-${n * 15}.png`, iconSize: [18, 18] }))

// all the marks for aircraft we've spotted so far
const aircraftMarkers = {}
const aircraftData = {}

// add maps to the map
const baseLayer = L.tileLayer.offline('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  minZoom: 6,
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiZ3V5cm95c2UiLCJhIjoiY2wyZXhjdXNkMDQ3NjNra2ptajhlN3J3OSJ9.y3JcnAPeRMLCLifILS8t0Q'
}).addTo(map)

// add buttons to save tiles in area viewed
L.control.savetiles(baseLayer, {
  zoomlevels: [6, 18], // optional zoomlevels to save, default current zoomlevel
  alwaysDownload: false,
  confirm(layer, successCallback) {
    // eslint-disable-next-line no-alert
    if (window.confirm(`Save ${layer._tilesforSave.length}`)) {
      successCallback();
    }
  },
  confirmRemoval(layer, successCallback) {
    // eslint-disable-next-line no-alert
    if (window.confirm('Remove all the tiles?')) {
      successCallback();
    }
  },
  saveText: 'D',
  rmText: 'C',
}).addTo(map);

// // add maps to the map
// L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
//   attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//   maxZoom: 18,
//   id: 'mapbox/streets-v11',
//   tileSize: 512,
//   zoomOffset: -1,
//   accessToken: 'pk.eyJ1IjoiZ3V5cm95c2UiLCJhIjoiY2wyZXhjdXNkMDQ3NjNra2ptajhlN3J3OSJ9.y3JcnAPeRMLCLifILS8t0Q'
// }).addTo(map)

// add our current location and center the view there
navigator.geolocation.getCurrentPosition(position => {
  const { latitude, longitude } = position.coords
  map.setView([ latitude, longitude ], 8)
  L.marker([ latitude, longitude ], { icon: homeIcon }).addTo(map)
}, error => {
  const latitude = 40.093565
  const longitude = -82.919196
  map.setView([ latitude, longitude ], 8)
  L.marker([ latitude, longitude ], { icon: homeIcon }).addTo(map)
}, { timeout : 1000 })

// set up aircraft garbage collection
setInterval(removeStaleMarkers, 5000)

// set up our event source and handle the events
let ws = new WebSocket(`ws://${location.host}/events`)

ws.onopen = event => {
  ws.onmessage = event => {

    // parse data out of the event
    const {
      icaoId, callsign, radio,
      latitude, longitude, altitude,
      heading, velocity, climb } = JSON.parse(event.data)

    // find our marker and it's popup
    let marker = aircraftMarkers[icaoId]
    let data = aircraftData[icaoId]

    // create it if it's not found and it has data worthy of creation
    if (!marker && latitude !== undefined && longitude !== undefined) {
      marker = L.marker([ latitude, longitude ], { icon: planeIcons[0] }).addTo(map)
      marker.bindPopup()
      aircraftMarkers[icaoId] = marker

      data = { icaoId, radio }
      aircraftData[icaoId] = data
    }

    // move the marker (if we have one) and update the data
    if (marker) {

      if (callsign !== undefined) data.callsign = callsign
      if (latitude !== undefined) data.latitude = latitude
      if (longitude !== undefined) data.longitude = longitude
      if (altitude !== undefined) data.altitude = altitude
      if (heading !== undefined) data.heading = heading
      if (velocity !== undefined) data.velocity = velocity
      if (climb !== undefined) data.climb = climb

      data.lastUpdated = new Date().getTime()

      setMarkerLocation(marker, data)
      setMarkerContent(marker, data)
    }
  }
}

function setMarkerLocation(marker, { latitude, longitude, heading }) {

  if (latitude !== undefined && longitude !== undefined) {
    marker.setLatLng([ latitude, longitude ])
  }

  if (heading !== undefined) {
    let index = Math.round(heading / 15)
    index = index === 24 ? 0 : index
    marker.setIcon(planeIcons[index])
  }
}

function setMarkerContent(marker, data) {
  let content

  if (data.callsign) {
    content = `Flight:
      <a href="https://flightaware.com/live/flight/${data.callsign}" target="_new">${data.callsign}</a>
      (<a href="http://localhost:8080/aircraft/icao/${data.icaoId}" target="_new">${data.icaoId}</a>)<br>`
  } else {
    content = `Flight:
      <a href="http://localhost:8080/aircraft/icao/${data.icaoId}" target="_new">${data.icaoId}</a><br>`
  }

  content += `
    Location:
      ${data.latitude},${data.longitude}<br>
    Altitude:
      ${data.altitude ?? 'unknown'} ft<br>
    Heading:
      ${data.heading ?? 'unknown'} deg<br>
    Velocity:
      ${data.velocity ?? 'unknown'} kn<br>
    Climb:
      ${data.climb ?? 'unknown'} ft<br>`

  marker.setPopupContent(content)
}

function removeStaleMarkers() {
  const now = new Date().getTime()
  for (const icaoId in aircraftData){
    if ((now - aircraftData[icaoId].lastUpdated) > AIRCRAFT_EXPIRATION_TIME) {
      const marker = aircraftMarkers[icaoId]

      marker.remove()
      delete aircraftData[icaoId]
      delete aircraftMarkers[icaoId]

      console.log("Removed aircraft:", icaoId )
    }
  }
}
