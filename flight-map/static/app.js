// All JS Goes here -Guy Royse

const eventSource = new EventSource('http://localhost:8080/events/aircraft/all')

const mechanical_birds = {}

eventSource.onmessage = e => {
  const message = JSON.parse(e.data)
  const aircraft = mechanical_birds[message.hex_ident] ?? {}
  mechanical_birds[message.hex_ident] = aircraft

  aircraft.hex_ident = message.hex_ident
  if (message.callsign) aircraft.callsign = message.callsign.trim()
  if (message.altitude) aircraft.altitude = Number(message.altitude)
  if (message.ground_speed) aircraft.ground_speed = Number(message.ground_speed)
  if (message.track) aircraft.track = Number(message.track)
  if (message.lat && message.lon) {
    aircraft.latlon = { latitude: Number(message.lat), longitude: Number(message.lon) }
  }

  console.log(aircraft)

  if (aircraft.latlon) {
    setMarker(aircraft)
  }

}

function setMarker(aircraft) {
    if (!aircraft.marker) {
        const myDiv = document.createElement('div')
        document.getElementById('icon-holder').appendChild(myDiv)
        myDiv.className = `${aircraft.hex_ident} plane-icon`

        const planeIcon = L.divIcon({html: myDiv})

        aircraft.icon = myDiv
        aircraft.marker = L.marker([0,0], { icon: planeIcon }).addTo(map)
    }

    // Set rotation (if we have data)
    if (aircraft.track) {
      aircraft.icon.style = `transform: rotate(${aircraft.track}deg);`
    }

    aircraft.marker.setLatLng([aircraft.latlon.latitude, aircraft.latlon.longitude])
}

// const map = L.map('map').setView([39.962222, -83.000556], 8)
const map = L.map('map').setView([40.2757599,-82.2492776], 8)

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZ3V5cm95c2UiLCJhIjoiY2wyZXhjdXNkMDQ3NjNra2ptajhlN3J3OSJ9.y3JcnAPeRMLCLifILS8t0Q'
}).addTo(map);
