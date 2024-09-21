<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  import { AircraftMap } from '@/aircraft-map'
  import { locationStore } from '@/stores/location-store'
  import { aircraftStore } from '@/stores/aircraft-store'

  let aircraftMap: AircraftMap

  onMount(() => {
    aircraftMap = AircraftMap.create('map')

    locationStore.subscribe(({ latitude, longitude, loading }) => {
      if (loading) return
      aircraftMap.centerView(latitude, longitude)
      aircraftMap.addHome(latitude, longitude)
    })

    aircraftStore.subscribe(aircraft => {
      for (const plane of aircraftMap.fetchPlanes()) {
        const status = aircraft.get(plane.icaoId)
        if (!status) {
          aircraftMap.removePlane(plane.icaoId)
        }
      }

      for (const [_, status] of aircraft) {
        aircraftMap.addUpdatePlane(status)
      }
    })
  })

  onDestroy(() => {
    aircraftMap.destroy()
  })
</script>

<main class="flex-shrink w-full h-full overflow-auto">
  <div id="map" class="w-full h-full"></div>
</main>
