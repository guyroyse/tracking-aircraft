<script lang="ts">
  import MenuItem from './MenuItem.svelte'
</script>

<nav class="flex-1 text-redis-dusk-50">
  <ul class="flex flex-row">
    <MenuItem path="/" text="Map" />
    <MenuItem path="/list" text="List" />
    <MenuItem path="/stats" text="Stats" />
  </ul>
</nav>
