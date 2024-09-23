<script lang="ts">
  import { aircraftStore } from '../../stores/aircraft-store'

  export let params: { icaoId: string }

  const icaoId = params.icaoId
  let aircraft = $aircraftStore.get(icaoId)
  aircraftStore.subscribe(() => {
    aircraft = $aircraftStore.get(icaoId)
  })
</script>

<div class="w-full text-3xl px-48 py-24">
  <!-- display the aircraft -->
  {#if !aircraft}
    <p>Aircraft {icaoId} not found.</p>
  {:else}
    <table class="w-full table-fixed font-mono text-3xl">
      <tbody>
        <tr class="border-b-2 border-dotted border-redis-dusk">
          <th class="text-left py-2">ICAO</th>
          <td class="text-right">{aircraft.icaoId}</td>
        </tr>
        <tr class="border-b-2 border-dotted border-redis-dusk">
          <th class="text-left py-2">Flight</th>
          <td class="text-right">{@html aircraft.linkCallsign}</td>
        </tr>
        <tr class="border-b-2 border-dotted border-redis-dusk">
          <th class="text-left py-2">Latitude</th>
          <td class="text-right">{aircraft.displayLatitude}</td>
        </tr>
        <tr class="border-b-2 border-dotted border-redis-dusk">
          <th class="text-left py-2">Longitude</th>
          <td class="text-right">{aircraft.displayLongitude}</td>
        </tr>
        <tr class="border-b-2 border-dotted border-redis-dusk">
          <th class="text-left py-2">Altitude</th>
          <td class="text-right">{aircraft.displayAltitude}</td>
        </tr>
        <tr class="border-b-2 border-dotted border-redis-dusk">
          <th class="text-left py-2">Heading</th>
          <td class="text-right">{aircraft.displayHeading}</td>
        </tr>
        <tr class="border-b-2 border-dotted border-redis-dusk">
          <th class="text-left py-2">Velocity</th>
          <td class="text-right">{aircraft.displayVelocity}</td>
        </tr>
        <tr class="border-b-2 border-dotted border-redis-dusk">
          <th class="text-left py-2">Climb</th>
          <td class="text-right">{aircraft.displayClimb}</td>
        </tr>
        <tr>
          <th class="text-left py-2">Last Updated</th>
          <td class="text-right">{aircraft.displayLastUpdatedTime}</td>
        </tr>
      </tbody>
    </table>
  {/if}
</div>
