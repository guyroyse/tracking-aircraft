<script lang="ts">
  import 'leaflet/dist/leaflet.css'
  import Router from 'svelte-spa-router'

  import Header from './components/layout/Header.svelte'
  import Footer from './components/layout/Footer.svelte'

  import AircraftMap from './components/map/AircraftMap.svelte'
  import AircraftList from './components/list/AircraftList.svelte'
  import AircraftSearch from './components/search/AircraftSearch.svelte'

  const routes = {
    '/': AircraftMap,
    '/list': AircraftList,
    '/search': AircraftSearch
  }
</script>

<Header />
<Router {routes} />
<Footer />
