<script lang="ts">
  import { aircraftStore } from '../../stores/aircraft-store'
  import { AircraftStatus } from '../../common/aircraft-status'
  import type { AircraftStatusData } from '../../common/aircraft-status'

  export let params: { icaoId: string }

  const icaoId = params.icaoId
  let aircraft: AircraftStatusData | null = $aircraftStore[icaoId] ?? null
  aircraftStore.subscribe(() => {
    aircraft = $aircraftStore[icaoId] ?? null
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
          <td class="text-right">{@html AircraftStatus.linkCallsign(aircraft)}</td>
        </tr>
        <tr class="border-b-2 border-dotted border-redis-dusk">
          <th class="text-left py-2">Latitude</th>
          <td class="text-right">{AircraftStatus.displayLatitude(aircraft)}</td>
        </tr>
        <tr class="border-b-2 border-dotted border-redis-dusk">
          <th class="text-left py-2">Longitude</th>
          <td class="text-right">{AircraftStatus.displayLongitude(aircraft)}</td>
        </tr>
        <tr class="border-b-2 border-dotted border-redis-dusk">
          <th class="text-left py-2">Altitude</th>
          <td class="text-right">{AircraftStatus.displayAltitude(aircraft)}</td>
        </tr>
        <tr class="border-b-2 border-dotted border-redis-dusk">
          <th class="text-left py-2">Heading</th>
          <td class="text-right">{AircraftStatus.displayHeading(aircraft)}</td>
        </tr>
        <tr class="border-b-2 border-dotted border-redis-dusk">
          <th class="text-left py-2">Velocity</th>
          <td class="text-right">{AircraftStatus.displayVelocity(aircraft)}</td>
        </tr>
        <tr class="border-b-2 border-dotted border-redis-dusk">
          <th class="text-left py-2">Climb</th>
          <td class="text-right">{AircraftStatus.displayClimb(aircraft)}</td>
        </tr>
        <tr>
          <th class="text-left py-2">Last Updated</th>
          <td class="text-right">{AircraftStatus.displayLastUpdatedTime(aircraft)}</td>
        </tr>
      </tbody>
    </table>
  {/if}
</div>
