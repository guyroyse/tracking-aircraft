<script lang="ts">
  import { location } from 'svelte-spa-router'

  const selectColor = (path: string) => ($location === path ? 'text-redis-white' : '')
</script>

<header>
  <nav class="flex-grow-0 bg-redis-midnight text-redis-dusk-50 text-xl tracking-wide p-3">
    <ul class="flex flex-row">
      <li class="pr-4 hover:text-redis-dusk-30 {selectColor('/')} cursor-pointer">
        <a href="#/">Map</a>
      </li>
      <li class="pr-4 hover:text-redis-dusk-30 {selectColor('/list')} cursor-pointer">
        <a href="#/list">List</a>
      </li>
      <li class="pr-4 hover:text-redis-dusk-30 {selectColor('/search')} cursor-pointer">
        <a href="#/search">Search</a>
      </li>
    </ul>
  </nav>
</header>
