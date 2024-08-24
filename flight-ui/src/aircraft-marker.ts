import { FLIGHT_SERVER_HOST, ICON_IDLE_TIME } from './_config'

import L from 'leaflet'

import { AircraftStatus } from './aircraft-status'

const planeIcons: L.Icon[] = [...Array(24).keys()].map(n =>
  L.icon({ iconUrl: `icons/plane-${n * 15}.png`, iconSize: [18, 18] })
)

export class AircraftMarker {
  private _hasLocation: boolean
  private aircraftStatus: AircraftStatus
  readonly leafletMarker: L.Marker
  readonly leafletPopup: L.Popup
  readonly leafletTooltip: L.Tooltip

  constructor(aircraftStatus: AircraftStatus) {
    this._hasLocation = false

    this.leafletPopup = L.popup()

    this.leafletTooltip = L.tooltip({
      permanent: true,
      direction: 'right',
      offset: L.point(12, 0)
    })

    this.leafletMarker = L.marker([0, 0], { icon: planeIcons[0] })
    this.leafletMarker.bindPopup(this.leafletPopup)
    this.leafletMarker.bindTooltip(this.leafletTooltip).openTooltip()

    this.aircraftStatus = aircraftStatus
    this.update(aircraftStatus)
  }

  static create(aircraftStatus: AircraftStatus): AircraftMarker {
    const marker = new AircraftMarker(aircraftStatus)
    return marker
  }

  get hasLocation(): boolean {
    return this._hasLocation
  }

  private set hasLocation(value: boolean) {
    this._hasLocation = value
  }

  get isExpired(): boolean {
    const now = new Date().getTime()
    return now - this.aircraftStatus.lastUpdated > ICON_IDLE_TIME
  }

  update(aircraftStatus: AircraftStatus): void {
    this.aircraftStatus.merge(aircraftStatus)

    this.updateLocation()
    this.updateHeading()
    this.updateContent()
    this.updateLabel()
  }

  remove(): void {
    this.leafletMarker.remove()
  }

  updateLocation(): void {
    const { latlng } = this.aircraftStatus
    if (latlng) {
      this.hasLocation = true
      this.leafletMarker.setLatLng(latlng)
    }
  }

  updateHeading(): void {
    const { heading } = this.aircraftStatus

    if (heading) {
      const index = Math.round(heading / 15)
      const icon = planeIcons[index === 24 ? 0 : index]
      if (icon) this.leafletMarker.setIcon(icon)
    }
  }

  updateContent(): void {
    let content = ''

    content += `ICAO: ${this.buildICAO_Link()}<br>`
    content += `Flight: ${this.buildFlight_Link() ?? 'unknown'}<br>`
    content += `Location: ${this.aircraftStatus.location ?? 'unknown'}<br>`
    content += `Altitude: ${this.aircraftStatus.altitude ?? 'unknown'} ft<br>`
    content += `Heading: ${this.aircraftStatus.heading ?? 'unknown'} deg<br>`
    content += `Velocity: ${this.aircraftStatus.velocity ?? 'unknown'} kn<br>`
    content += `Climb: ${this.aircraftStatus.climb ?? 'unknown'} ft<br>`

    this.leafletPopup.setContent(content)
  }

  updateLabel(): void {
    const label = this.aircraftStatus.callsign ?? this.aircraftStatus.icaoId
    this.leafletTooltip.setContent(label)
  }

  private buildICAO_Link(): string {
    const icaoId = this.aircraftStatus.icaoId
    const url = `${FLIGHT_SERVER_HOST}/aircraft/icao/${icaoId}`
    return `<a href="${url}" target="_new">${icaoId}</a>`
  }

  private buildFlight_Link(): string | null {
    const callsign = this.aircraftStatus.callsign

    if (!callsign) return null

    const url = `https://flightaware.com/live/flight/${callsign}`
    const link = `<a href="${url}" target="_new">${callsign}</a>`
    return link
  }
}
