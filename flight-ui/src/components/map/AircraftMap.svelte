<script lang="ts">
  import { homePositionStore, currentPositionStore, updateCurrentPosition } from '../../stores/location-store'
  import { aircraftStore } from '../../stores/aircraft-store'

  import { AircraftMap } from './aircraft-map'

  let aircraftMap: AircraftMap

  /* We just need to center the map once. */
  let mapCentered = false

  /* we'll need these when the map gets destroyed */
  let currentPosition = { latitude: 0, longitude: 0, zoom: 0 }

  function createMap(element: HTMLElement) {
    /* Create the map and bind it to the element. */
    aircraftMap = AircraftMap.create(element)

    /* Subscribe to the home position store and add a home icon. */
    homePositionStore.subscribe(position => {
      console.log('Home position report', position)
      const { latitude, longitude, loading } = position
      if (!loading) {
        aircraftMap.addHome(latitude, longitude)
        aircraftMap.centerView(position.latitude, position.longitude)
      }
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
  }
</script>

<main class="flex-shrink w-full h-full overflow-auto">
  <div class="w-full h-full" use:createMap></div>
</main>
