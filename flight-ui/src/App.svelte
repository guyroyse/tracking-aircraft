<script lang="ts">
  import 'leaflet/dist/leaflet.css'

  import Header from './components/Header.svelte'
  import Footer from './components/Footer.svelte'

  import Router from 'svelte-spa-router'

  import AircraftMap from './AircraftMap.svelte'
  import AircraftList from './AircraftList.svelte'
  import AircraftSearch from './AircraftSearch.svelte'

  const routes = {
    '/': AircraftMap,
    '/list': AircraftList,
    '/search': AircraftSearch
  }
</script>

<Header />
<Router {routes} />
<Footer />
