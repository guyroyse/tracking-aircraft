<script lang="ts">
  import { link } from 'svelte-spa-router'
  import active from 'svelte-spa-router/active'

  export let path: string
  export let text: string
</script>

<li class="pr-4 hover:text-redis-dusk-30 cursor-pointer">
  <a href="{path}" use:link use:active="{{ className: 'text-redis-white' }}">{text}</a>
</li>
