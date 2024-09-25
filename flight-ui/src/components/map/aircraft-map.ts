import L from 'leaflet'

import { AircraftMarker } from './aircraft-marker'
import { AircraftStatus } from '../../common/aircraft-status'

const homeIcon = L.icon({ iconUrl: 'icons/home.png', iconSize: [16, 16] })

const planeIcons: L.Icon[] = []

for (let i = 0; i < 24; i++) {
  planeIcons.push(L.icon({ iconUrl: `icons/plane-${i * 15}.png`, iconSize: [18, 18] }))
}

export class AircraftMap {
  private map: L.Map
  private markers: Map<string, AircraftMarker>

  private constructor(map: L.Map) {
    this.map = map
    this.markers = new Map()
  }

  static create(element: HTMLElement): AircraftMap {
    const leafletMap = L.map(element)
    const aircraftMap = new AircraftMap(leafletMap)
    aircraftMap.addTileLayer()
    return aircraftMap
  }

  private addTileLayer(): void {
    const urlTemplate = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    const options = {
      maxZoom: 18,
      tileSize: 512,
      zoomOffset: -1,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }

    const tileLayer = L.tileLayer(urlTemplate, options)
    tileLayer.addTo(this.map)
  }

  centerView(latitude: number, longitude: number, zoom: number = 8): void {
    this.map.setView([latitude, longitude], zoom)
  }

  addHome(latitude: number, longitude: number): void {
    const marker = L.marker([latitude, longitude], { icon: homeIcon })
    marker.addTo(this.map)
  }

  fetchPlanes(): AircraftStatus[] {
    return Array.from(this.markers.values()).map(marker => marker.aircraftStatus)
  }

  addUpdatePlane(aircraftStatus: AircraftStatus): void {
    const foundMarker = this.markers.get(aircraftStatus.icaoId)
    if (foundMarker) {
      const hadLocation = foundMarker.hasLocation
      foundMarker.update(aircraftStatus)
      const hasLocation = foundMarker.hasLocation
      if (!hadLocation && hasLocation) {
        console.log(new Date().toTimeString(), `Adding new aircraft to map ${aircraftStatus.icaoId}`)
        foundMarker.leafletMarker.addTo(this.map)
      }
    } else {
      const marker = AircraftMarker.create(aircraftStatus)
      if (marker.hasLocation) marker.leafletMarker.addTo(this.map)
      this.markers.set(aircraftStatus.icaoId, marker)
    }
  }

  removePlane(icaoId: string): void {
    const marker = this.markers.get(icaoId)
    if (marker) {
      marker.remove()
      this.markers.delete(icaoId)
      console.log(new Date().toTimeString(), `Removed expired aircraft from map ${icaoId}`)
    }
  }

  removeExpiredMarkers() {
    this.markers.forEach(marker => {
      if (marker.isExpired) marker.remove()
    })
  }

  destroy(): void {
    this.markers.forEach(marker => marker.remove())
    this.map.remove()
  }
}
