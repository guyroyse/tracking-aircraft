<script lang="ts">
  import { homePositionStore } from '../../stores/location-store'
  import { aircraftStore } from '../../stores/aircraft-store'

  import { AircraftMap } from './aircraft-map'
  import type { AircraftStatusData } from '../../common/aircraft-status'

  let aircraftMap: AircraftMap

  function createMap(element: HTMLElement) {
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
      console.log('Aircraft status count', Object.keys(aircraftStatuses).length)
      /* Remove planes that are no longer in the store. */
      for (const plane of aircraftMap.fetchPlanes()) {
        const status = aircraftStatuses[plane.icaoId]
        if (!status) aircraftMap.removePlane(plane.icaoId)
      }

      /*
        TODO: This is the problem. We need to only update aircraft
        that have changed. This might need to be done in the aircraft
        store somehow.
      */

      /* Add or update planes that *are* in the store. */
      for (const icaoId in aircraftStatuses) {
        const status = aircraftStatuses[icaoId] as AircraftStatusData
        aircraftMap.addUpdatePlane(status)
      }
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
