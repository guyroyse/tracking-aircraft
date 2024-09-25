import L from 'leaflet'

import { AircraftStatus } from '../../common/aircraft-status'
import type { AircraftStatusData } from '../../common/aircraft-status'

const planeIcons: L.Icon[] = [...Array(24).keys()].map(n =>
  L.icon({ iconUrl: `icons/plane-${n * 15}.png`, iconSize: [18, 18] })
)

export class AircraftMarker {
  private _hasLocation: boolean
  public aircraftStatus: AircraftStatusData
  readonly leafletMarker: L.Marker
  readonly leafletPopup: L.Popup
  readonly leafletTooltip: L.Tooltip

  private constructor(aircraftStatus: AircraftStatusData) {
    this._hasLocation = false

    this.leafletPopup = L.popup({
      className: 'font-mono',
      interactive: true
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

  static create(aircraftStatus: AircraftStatusData): AircraftMarker {
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
    return AircraftStatus.isExpired(this.aircraftStatus)
  }

  update(aircraftStatus: AircraftStatusData): void {
    this.aircraftStatus = AircraftStatus.merge(this.aircraftStatus, aircraftStatus)

    this.updateLocation()
    this.updateHeading()
    this.updateContent()
    this.updateLabel()
  }

  remove(): void {
    this.leafletMarker.remove()
  }

  updateLocation(): void {
    const latlng = AircraftStatus.latlng(this.aircraftStatus)
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
      `ICAO     : ${AircraftStatus.linkIcao(this.aircraftStatus)}<br>` +
      `Flight   : ${AircraftStatus.linkCallsign(this.aircraftStatus)}<br>` +
      `Location : ${AircraftStatus.displayLocation(this.aircraftStatus)}<br>` +
      `Altitude : ${AircraftStatus.displayAltitude(this.aircraftStatus)}<br>` +
      `Heading  : ${AircraftStatus.displayHeading(this.aircraftStatus)}<br>` +
      `Velocity : ${AircraftStatus.displayVelocity(this.aircraftStatus)}<br>` +
      `Climb    : ${AircraftStatus.displayClimb(this.aircraftStatus)}<br>` +
      `Last Msg : ${AircraftStatus.displayLastUpdatedTime(this.aircraftStatus)}<br>` +
      `</pre>`

    this.leafletPopup.setContent(content)
  }

  updateLabel(): void {
    const label = `${this.aircraftStatus.callsign ?? this.aircraftStatus.icaoId}`
    this.leafletTooltip.setContent(label)
  }
}
