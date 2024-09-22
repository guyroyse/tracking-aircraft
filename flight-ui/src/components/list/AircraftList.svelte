<script lang="ts">
  import { aircraftStore } from '../../stores/aircraft-store'
</script>

<main class="flex-shrink w-full h-full overflow-auto">
  <div class="w-full h-full text-3xl">
    {#if $aircraftStore.size === 0}
      <p class="">No aircraft in the area.</p>
    {:else}
      <table>
        <thead>
          <tr>
            <th>ICAO</th>
            <th>Flight</th>
            <th>Location</th>
            <th>Altitude</th>
            <th>Heading</th>
            <th>Velocity</th>
            <th>Climb</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {#each $aircraftStore.values() as aircraft}
            <tr>
              <td>{aircraft.icaoId}</td>
              <td>{aircraft.callsign}</td>
              <td>{aircraft.location}</td>
              <td>{aircraft.altitude} ft</td>
              <td>{aircraft.heading} deg</td>
              <td>{aircraft.velocity} kn</td>
              <td>{aircraft.climb} ft</td>
              <td>{aircraft.lastUpdated}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</main>
