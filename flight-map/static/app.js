// map and icons
const map = L.map('map')
const homeIcon = L.icon({ iconUrl: 'icons/home.png', iconSize: [16, 16] })
const planeIcons = [...Array(24).keys()]
  .map(n => L.icon({ iconUrl: `icons/plane-${n * 15}.png`, iconSize: [18, 18] }))

// all the marks for aircraft we've spotted so far
const aircraftMarkers = {}

// add maps to the map
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiZ3V5cm95c2UiLCJhIjoiY2wyZXhjdXNkMDQ3NjNra2ptajhlN3J3OSJ9.y3JcnAPeRMLCLifILS8t0Q'
}).addTo(map);

// add our current location and center the view there
navigator.geolocation.getCurrentPosition(position => {
  const { latitude, longitude } = position.coords
  map.setView([ latitude, longitude ], 8)
  L.marker([ latitude, longitude ], { icon: homeIcon }).addTo(map)
})

// set up our event source and handle the events
const eventSource = new EventSource('http://localhost:8080/events/aircraft/all')

eventSource.onmessage = event => {

  // parse data out of the event
  const { icacoId, latitude, longitude, heading } = JSON.parse(event.data)

  // find our marker
  let marker = aircraftMarkers[icacoId]

  // create it if it's not found and it has data worthy of creation
  if (!marker && latitude !== undefined && longitude !== undefined) {
    marker = L.marker([ latitude, longitude ], { icon: planeIcons[0] }).addTo(map)
    aircraftMarkers[icacoId] = marker
  }

  // move the marker (if we have one)
  if (marker) {
    setMarkerLocation(marker, latitude, longitude)
    setMarkerHeading(marker, heading)
  }
}

function setMarkerLocation(marker, latitude, longitude) {
  if (latitude !== undefined && longitude !== undefined) {
    marker.setLatLng([latitude, longitude])
  }
}

function setMarkerHeading(marker, heading) {
  if (heading) {
    let index = Math.round(heading / 15)
    index = index === 24 ? 0 : index
    marker.setIcon(planeIcons[index])
  }
}
