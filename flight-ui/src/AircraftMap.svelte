<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { location } from './stores/location-store'

  import L from 'leaflet'

  const homeIcon = L.icon({ iconUrl: 'icons/home.png', iconSize: [16, 16] })
  const planeIcons: L.Icon[] = []

  for (let i = 0; i < 24; i++) {
    planeIcons.push(L.icon({ iconUrl: `icons/plane-${i * 15}.png`, iconSize: [18, 18] }))
  }

  let map: L.Map

  onMount(() => {
    map = L.map('map')

    const urlTemplate = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    const options = {
      maxZoom: 18,
      tileSize: 512,
      zoomOffset: -1,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }

    L.tileLayer(urlTemplate, options).addTo(map)

    location.subscribe(({ latitude, longitude, loading }) => {
      if (loading) return
      map.setView([latitude, longitude], 8)
      L.marker([latitude, longitude], { icon: homeIcon }).addTo(map)
    })
  })

  onDestroy(() => {
    map.remove()
  })
</script>

<main class="flex-shrink w-full h-full overflow-auto">
  <div id="map" class="w-full h-full"></div>
</main>
