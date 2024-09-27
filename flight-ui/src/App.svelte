<script lang="ts">
  import 'leaflet/dist/leaflet.css'
  import Router from 'svelte-spa-router'

  import Header from './components/layout/Header.svelte'
  import Footer from './components/layout/Footer.svelte'

  import AircraftMap from './components/map/AircraftMap.svelte'
  import AircraftList from './components/list/AircraftList.svelte'
  import AircraftStats from './components/stats/AircraftStats.svelte'
  import AircraftDetail from './components/detail/AircraftDetail.svelte'

  const routes = {
    '/': AircraftMap,
    '/list': AircraftList,
    '/stats': AircraftStats,
    '/aircraft/:icaoId': AircraftDetail
  }
</script>

<Header />
<main class="flex-shrink w-full h-full overflow-auto text-redis-midnight bg-redis-white">
  <Router {routes} />
</main>
<Footer />
