import L from 'leaflet'

import { AircraftMarker } from './aircraft-marker'
import { AircraftStatus } from '../../common/aircraft-status'
import type { AircraftStatusData } from '../../common/aircraft-status'
import type { CurrentPosition } from '../../stores/location-store'

const homeIcon = L.icon({ iconUrl: 'icons/home.png', iconSize: [16, 16] })

const planeIcons: L.Icon[] = []

for (let i = 0; i < 24; i++) {
  planeIcons.push(L.icon({ iconUrl: `icons/plane-${i * 15}.png`, iconSize: [18, 18] }))
}

export class AircraftMap {
  private map: L.Map
  private homeMarker: L.Marker
  private markers: Map<string, AircraftMarker>

  private constructor(map: L.Map, homeMarker: L.Marker) {
    this.map = map
    this.homeMarker = homeMarker
    this.markers = new Map()
  }

  static create(element: HTMLElement): AircraftMap {
    const leafletMap = L.map(element)
    const homeMarker = L.marker([0, 0], { icon: homeIcon })
    const aircraftMap = new AircraftMap(leafletMap, homeMarker)
    aircraftMap.addTileLayer()
    homeMarker.addTo(leafletMap)
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
    this.homeMarker.setLatLng([latitude, longitude])
  }

  onPositionChanged(callback: (position: CurrentPosition) => void): void {
    this.map.on('moveend', () => {
      const { lat, lng } = this.map.getCenter()
      const zoom = this.map.getZoom()
      callback({ latitude: lat, longitude: lng, zoom })
    })
  }

  fetchPlanes(): AircraftStatusData[] {
    return Array.from(this.markers.values()).map(marker => marker.aircraftStatus)
  }

  addUpdatePlane(aircraftStatus: AircraftStatusData): void {
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
      console.log(new Date().toTimeString(), `Adding new aircraft to map ${aircraftStatus.icaoId}`)
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
