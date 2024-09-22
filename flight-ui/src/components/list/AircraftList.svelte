<script lang="ts">
  import { aircraftStore } from '../../stores/aircraft-store'
</script>

<div class="w-full text-3xl px-48 py-12">
  {#if $aircraftStore.size === 0}
    <p class="">No aircraft in the area.</p>
  {:else}
    <table class="table-auto w-full text-right font-mono">
      <thead>
        <tr class="border-b-2 border-redis-midnight">
          <th class="text-left">ICAO</th>
          <th class="text-left">Flight</th>
          <th>Latitude</th>
          <th>Longitude</th>
          <th>Altitude</th>
          <th>Heading</th>
          <th>Velocity</th>
          <th>Climb</th>
          <th>Last Updated</th>
        </tr>
      </thead>
      <tbody>
        {#each $aircraftStore.values() as aircraft}
          <tr class="even:bg-redis-light-gray">
            <td class="text-left py-2">{aircraft.icaoId}</td>
            <td class="text-left">{aircraft.displayCallsign}</td>
            <td>{aircraft.displayLatitude}</td>
            <td>{aircraft.displayLongitude}</td>
            <td>{aircraft.displayAltitude}</td>
            <td>{aircraft.displayHeading}</td>
            <td>{aircraft.displayVelocity}</td>
            <td>{aircraft.displayClimb}</td>
            <td>{aircraft.displayLastUpdatedTime}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
