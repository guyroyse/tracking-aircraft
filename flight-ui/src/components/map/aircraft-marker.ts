import L from 'leaflet'

import { FLIGHT_SERVER_HOST } from '../../config'
import { AircraftStatus } from '../../common/aircraft-status'

const planeIcons: L.Icon[] = [...Array(24).keys()].map(n =>
  L.icon({ iconUrl: `icons/plane-${n * 15}.png`, iconSize: [18, 18] })
)

export class AircraftMarker {
  private _hasLocation: boolean
  readonly aircraftStatus: AircraftStatus
  readonly leafletMarker: L.Marker
  readonly leafletPopup: L.Popup
  readonly leafletTooltip: L.Tooltip

  private constructor(aircraftStatus: AircraftStatus) {
    this._hasLocation = false

    this.leafletPopup = L.popup({
      className: 'font-mono'
    })

    this.leafletTooltip = L.tooltip({
      permanent: true,
      direction: 'auto',
      offset: L.point(12, 0),
      opacity: 0.9,
      className: 'font-mono'
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
    return this.aircraftStatus.isExpired
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
    const content =
      `<pre>` +
      `ICAO     : ${this.buildICAO_Link()}<br>` +
      `Flight   : ${this.buildFlight_Link() ?? 'unknown'}<br>` +
      `Location : ${this.aircraftStatus.location ?? 'unknown'}<br>` +
      `Altitude : ${this.aircraftStatus.altitude ?? 'unknown'} ft<br>` +
      `Heading  : ${this.aircraftStatus.heading ?? 'unknown'} deg<br>` +
      `Velocity : ${this.aircraftStatus.velocity ?? 'unknown'} kn<br>` +
      `Climb    : ${this.aircraftStatus.climb ?? 'unknown'} ft<br>` +
      `Last Msg : ${this.buildLastUpdated()}<br>` +
      `</pre>`

    this.leafletPopup.setContent(content)
  }

  updateLabel(): void {
    const label = `${this.aircraftStatus.callsign ?? this.aircraftStatus.icaoId}`
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

  private buildLastUpdated(): string {
    const lastUpdated = this.aircraftStatus.lastUpdated
    return new Date(lastUpdated).toLocaleString()
  }
}
