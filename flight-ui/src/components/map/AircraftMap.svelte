<script lang="ts">
  import { locationStore } from '../../stores/location-store'
  import { aircraftStore } from '../../stores/aircraft-store'

  import { AircraftMap } from './aircraft-map'

  let aircraftMap: AircraftMap

  function createMap(element: HTMLElement) {
    /* Create the map and bind it to the element. */
    aircraftMap = AircraftMap.create(element)

    /* Subscribe to the location store and update the map's center and add a home icon. */
    locationStore.subscribe(({ latitude, longitude, loading }) => {
      if (loading) return
      aircraftMap.centerView(latitude, longitude)
      aircraftMap.addHome(latitude, longitude)
    })

    /* Subscribe to the aircraft store and update the planes on the map. */
    aircraftStore.subscribe(aircraft => {
      /* Remove planes that are no longer in the store. */
      for (const plane of aircraftMap.fetchPlanes()) {
        const status = aircraft.get(plane.icaoId)
        if (!status) {
          aircraftMap.removePlane(plane.icaoId)
        }
      }

      /* Add or update planes that *are* in the store. */
      for (const [_, status] of aircraft) {
        aircraftMap.addUpdatePlane(status)
      }
    })

    /* Return a function to destroy the map when the elements is removed from the DOM. */
    return { destroy: () => aircraftMap.destroy() }
  }
</script>

<main class="flex-shrink w-full h-full overflow-auto">
  <div id="map" class="w-full h-full" use:createMap></div>
</main>
