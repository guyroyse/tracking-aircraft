<script lang="ts">
  import MenuItem from './MenuItem.svelte'
</script>

<nav class="flex-grow-0 bg-redis-midnight text-redis-dusk-50 text-xl tracking-wide p-3">
  <ul class="flex flex-row">
    <MenuItem path="/" text="Map" />
    <MenuItem path="/list" text="List" />
    <MenuItem path="/search" text="Search" />
  </ul>
</nav>
