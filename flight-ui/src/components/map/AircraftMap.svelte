<script lang="ts">
  import Optional from '@guyroyse/optional'

  import { currentPositionStore, homePositionStore, updateCurrentPosition } from '../../stores/location-store'

  import { aircraftStore } from '../../stores/aircraft-store'
  import type { AircraftStatuses } from '../../stores/aircraft-store'

  import { AircraftMap } from './aircraft-map'
  import { AircraftStatus, type AircraftStatusData } from '../../common/aircraft-status'

  let aircraftMap: AircraftMap

  function createMap(element: HTMLElement) {
    /* Keep track of the previous aircraft statuses. */
    let previousAircraftStatuses: AircraftStatuses = {}

    /* Create the map and bind it to the element. */
    aircraftMap = AircraftMap.create(element)

    /* Return to the previous position when we create the map. */
    console.log('Restoring previous position', $currentPositionStore)
    const { latitude, longitude, zoom } = $currentPositionStore
    aircraftMap.centerView(latitude, longitude, zoom)

    /* Log position changes in the current position store. */
    aircraftMap.onPositionChanged(position => {
      const { latitude, longitude, zoom } = position
      updateCurrentPosition(latitude, longitude, zoom)
    })

    /* Subscribe to the home position store and add a home icon. */
    const homePositionUnsubscribe = homePositionStore.subscribe(position => {
      console.log('Home position report', position)
      const { latitude, longitude } = position
      aircraftMap.addHome(latitude, longitude)
      if ($currentPositionStore.latitude === 0 && $currentPositionStore.longitude === 0) {
        aircraftMap.centerView(latitude, longitude, 8)
      }
    })

    /* Subscribe to the aircraft store and update the planes on the map. */
    const aircraftUnsubscribe = aircraftStore.subscribe(aircraftStatuses => {
      let previousStatus: Optional<AircraftStatusData>
      let currentStatus: Optional<AircraftStatusData>

      console.log('Received aircraft status reports', Object.keys(aircraftStatuses).length)

      /* Loop over incoming aircraft and add or update if there are changes. */
      for (const icaoId in aircraftStatuses) {
        previousStatus = Optional.ofNullable(previousAircraftStatuses[icaoId])
        currentStatus = Optional.ofNullable(aircraftStatuses[icaoId])

        if (previousStatus.isPresent()) {
          const hasChanged = AircraftStatus.hasChanged(previousStatus.get(), currentStatus.get())
          if (hasChanged) aircraftMap.addUpdatePlane(currentStatus.get())
        } else {
          aircraftMap.addUpdatePlane(currentStatus.get())
        }
      }

      /* Loop over previous aircraft and remove any that aren't longer present
         in the current set. */
      for (let icaoId in previousAircraftStatuses) {
        currentStatus = Optional.ofNullable(aircraftStatuses[icaoId])
        if (!currentStatus.isPresent()) {
          aircraftMap.removePlane(icaoId)
        }
      }

      /* Clone the current aircraft statuses so we can compare them next time.
         Otherwise, it's just the same object and it gets updated in place. */
      previousAircraftStatuses = { ...aircraftStatuses }
    })

    return {
      destroy() {
        homePositionUnsubscribe()
        aircraftUnsubscribe()
      }
    }
  }
</script>

<div class="w-full h-full" use:createMap></div>
