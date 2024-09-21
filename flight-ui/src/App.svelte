<script lang="ts">
  import 'leaflet/dist/leaflet.css'
  import Router from 'svelte-spa-router'

  import Header from '@/components/Header.svelte'
  import AircraftMap from '@/AircraftMap.svelte'
  import AircraftList from '@/AircraftList.svelte'
  import AircraftSearch from '@/AircraftSearch.svelte'
  import Footer from '@/components/Footer.svelte'

  const routes = {
    '/': AircraftMap,
    '/list': AircraftList,
    '/search': AircraftSearch
  }
</script>

<Header />
<Router {routes} />
<Footer />
