<script lang="ts">
  import Optional from '@guyroyse/optional'

  import { homePositionStore } from '../../stores/location-store'
  import { aircraftStore } from '../../stores/aircraft-store'
  import type { AircraftStatuses } from '../../stores/aircraft-store'

  import { AircraftMap } from './aircraft-map'
  import type { AircraftStatusData } from '../../common/aircraft-status'

  let aircraftMap: AircraftMap

  function createMap(element: HTMLElement) {
    /* Keep track of the previous aircraft statuses. */
    let previousAircraftStatuses: AircraftStatuses = {}

    /* Create the map and bind it to the element. */
    aircraftMap = AircraftMap.create(element)

    /* Subscribe to the home position store and add a home icon. */
    const homePositionUnsubscribe = homePositionStore.subscribe(position => {
      console.log('Home position report', position)
      const { latitude, longitude, loading } = position
      if (!loading) {
        aircraftMap.addHome(latitude, longitude)
        aircraftMap.centerView(position.latitude, position.longitude)
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
          const previousString = JSON.stringify(previousStatus.get())
          const currentString = JSON.stringify(currentStatus.get())
          if (previousString !== currentString) {
            aircraftMap.addUpdatePlane(currentStatus.get())
          }
        } else {
          aircraftMap.addUpdatePlane(currentStatus.get())
        }
      }

      for (let icaoId in previousAircraftStatuses) {
        currentStatus = Optional.ofNullable(aircraftStatuses[icaoId])
        if (!currentStatus.isPresent()) {
          aircraftMap.removePlane(icaoId)
        }
      }

      // clone the current aircraft statuses so we can compare them next time
      previousAircraftStatuses = { ...aircraftStatuses }

      // /* Remove planes that are no longer in the store. Could we do this with
      //    the same loop the removed them from the store? Can that loop access
      //    the map? */
      // for (const plane of aircraftMap.fetchPlanes()) {
      //   const status = aircraftStatuses[plane.icaoId]
      //   if (!status) aircraftMap.removePlane(plane.icaoId)
      // }

      // /* Add or update planes that *are* in the store. */
      // for (const icaoId in aircraftStatuses) {
      //   const status = aircraftStatuses[icaoId] as AircraftStatusData
      //   aircraftMap.addUpdatePlane(status)
      // }
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
