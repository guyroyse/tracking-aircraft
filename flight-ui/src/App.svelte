<script lang="ts">
  import Header from './Header.svelte'
  import Footer from './Footer.svelte'

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
