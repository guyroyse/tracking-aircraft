import { MAP_ACCESS_TOKEN } from './_config'

import L from 'leaflet'

import { AircraftStatus } from './aircraft-status'
import { AircraftMarker } from './aircraft-marker'

const homeIcon = L.icon({ iconUrl: 'icons/home.png', iconSize: [16, 16] })

const planeIcons: L.Icon[] = []

for (let i = 0; i < 24; i++) {
  planeIcons.push(L.icon({ iconUrl: `icons/plane-${i * 15}.png`, iconSize: [18, 18] }))
}

export class AircraftMap {
  private map: L.Map
  private markers: Map<string, AircraftMarker> = new Map()

  constructor(map: L.Map) {
    this.map = map
    this.markers = new Map()
  }

  static create(mapElementID: string = 'map'): AircraftMap {
    const leafletMap = L.map(mapElementID)
    const aircraftMap = new AircraftMap(leafletMap)
    aircraftMap.addTileLayer()
    return aircraftMap
  }

  private addTileLayer(): void {
    const urlTemplate = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'
    const options = {
      accessToken: MAP_ACCESS_TOKEN,
      id: 'mapbox/streets-v11',
      maxZoom: 18,
      tileSize: 512,
      zoomOffset: -1,
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
    }

    const titleLayer = L.tileLayer(urlTemplate, options)
    titleLayer.addTo(this.map)
  }

  centerView(latitude: number, longitude: number, zoom: number = 8): void {
    this.map.setView([latitude, longitude], zoom)
  }

  addHome(latitude: number, longitude: number): void {
    const marker = L.marker([latitude, longitude], { icon: homeIcon })
    marker.addTo(this.map)
  }

  addUpdatePlane(aircraftStatus: AircraftStatus): void {
    const foundMarker = this.markers.get(aircraftStatus.icaoId)
    if (foundMarker) {
      const hadLocation = foundMarker.hasLocation
      foundMarker.update(aircraftStatus)
      const hasLocation = foundMarker.hasLocation
      if (!hadLocation && hasLocation) foundMarker.leafletMarker.addTo(this.map)
    } else {
      const marker = AircraftMarker.create(aircraftStatus)
      if (marker.hasLocation) marker.leafletMarker.addTo(this.map)
      this.markers.set(aircraftStatus.icaoId, marker)
    }
  }

  removeExpiredMarkers() {
    this.markers.forEach(marker => {
      if (marker.isExpired) marker.remove()
    })
  }
}
