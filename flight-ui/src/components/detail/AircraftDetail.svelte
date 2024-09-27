<script lang="ts">
  import Optional from '@guyroyse/optional'
  import { aircraftStore } from '../../stores/aircraft-store'
  import { AircraftStatus } from '../../common/aircraft-status'
  import type { AircraftStatusData } from '../../common/aircraft-status'

  import { statsStore } from '../../stores/stats-store'

  export let params: { icaoId: string }

  const icaoId = params.icaoId
  let aircraft: Optional<AircraftStatusData> = Optional.ofNullable($aircraftStore[icaoId])
  aircraftStore.subscribe(() => (aircraft = Optional.ofNullable($aircraftStore[icaoId])))
</script>

<div class="w-full text-3xl px-48 py-24">
  {#if !aircraft.isPresent()}
    <p>Aircraft {icaoId} not found.</p>
  {:else}
    <div class="flex flex-col w-full font-mono text-3xl">
      <div class="flex flex-row border-b-2 border-solid border-redis-dusk py-3">
        <div class="flex-1"></div>
        <div class="flex-1 text-center">Percentile</div>
        <div class="flex-1 text-center">Mean</div>
        <div class="flex-1 text-center">Median</div>
        <div class="flex-1 text-center">p90</div>
        <div class="flex-1 text-center">p95</div>
        <div class="flex-1 text-center">p99</div>
        <div class="flex-1"></div>
      </div>

      <div class="flex flex-row border-b-2 border-dotted border-redis-dusk py-3">
        <div class="flex-1 text-left">ICAO</div>
        <div class="flex-1 text-right">{aircraft.get().icaoId}</div>
      </div>

      <div class="flex flex-row border-b-2 border-dotted border-redis-dusk py-3">
        <div class="flex-1 text-left">Flight</div>
        <div class="flex-1 text-right">{@html AircraftStatus.linkCallsign(aircraft.get())}</div>
      </div>

      <div class="flex flex-row border-b-2 border-dotted border-redis-dusk py-3">
        <div class="flex-1 text-left">Latitude</div>
        <div class="flex-1 text-right">{AircraftStatus.displayLatitude(aircraft.get())}</div>
      </div>

      <div class="flex flex-row border-b-2 border-dotted border-redis-dusk py-3">
        <div class="flex-1 text-left">Longitude</div>
        <div class="flex-1 text-right">{AircraftStatus.displayLongitude(aircraft.get())}</div>
      </div>

      <div class="flex flex-row border-b-2 border-dotted border-redis-dusk py-3">
        <div class="flex-1 text-left">Heading</div>
        <div class="flex-1 text-right">{AircraftStatus.displayHeading(aircraft.get())}</div>
      </div>

      <div class="flex flex-row border-b-2 border-dotted border-redis-dusk py-3">
        <div class="flex-1 text-left">Velocity</div>
        <div class="flex-1 text-center">{AircraftStatus.displayVelocityPercentile(aircraft.get())}</div>
        <div class="flex-1 text-center">{AircraftStatus.displayNumber($statsStore.velocity.mean)}</div>
        <div class="flex-1 text-center">{AircraftStatus.displayNumber($statsStore.velocity.median)}</div>
        <div class="flex-1 text-center">{AircraftStatus.displayNumber($statsStore.velocity.p90)}</div>
        <div class="flex-1 text-center">{AircraftStatus.displayNumber($statsStore.velocity.p95)}</div>
        <div class="flex-1 text-center">{AircraftStatus.displayNumber($statsStore.velocity.p99)}</div>
        <div class="flex-1 text-right">{AircraftStatus.displayVelocity(aircraft.get())}</div>
      </div>

      <div class="flex flex-row border-b-2 border-dotted border-redis-dusk py-3">
        <div class="flex-1 text-left">Altitude</div>
        <div class="flex-1 text-center">{AircraftStatus.displayAltitudePercentile(aircraft.get())}</div>
        <div class="flex-1 text-center">{AircraftStatus.displayNumber($statsStore.altitude.mean)}</div>
        <div class="flex-1 text-center">{AircraftStatus.displayNumber($statsStore.altitude.median)}</div>
        <div class="flex-1 text-center">{AircraftStatus.displayNumber($statsStore.altitude.p90)}</div>
        <div class="flex-1 text-center">{AircraftStatus.displayNumber($statsStore.altitude.p95)}</div>
        <div class="flex-1 text-center">{AircraftStatus.displayNumber($statsStore.altitude.p99)}</div>
        <div class="flex-1 text-right">{AircraftStatus.displayAltitude(aircraft.get())}</div>
      </div>

      <div class="flex flex-row border-b-2 border-dotted border-redis-dusk py-3">
        <div class="flex-1 text-left">Climb</div>
        <div class="flex-1 text-center">{AircraftStatus.displayVelocityPercentile(aircraft.get())}</div>
        <div class="flex-1 text-center">{AircraftStatus.displayNumber($statsStore.climb.mean)}</div>
        <div class="flex-1 text-center">{AircraftStatus.displayNumber($statsStore.climb.median)}</div>
        <div class="flex-1 text-center">{AircraftStatus.displayNumber($statsStore.climb.p90)}</div>
        <div class="flex-1 text-center">{AircraftStatus.displayNumber($statsStore.climb.p95)}</div>
        <div class="flex-1 text-center">{AircraftStatus.displayNumber($statsStore.climb.p99)}</div>
        <div class="flex-1 text-right">{AircraftStatus.displayClimb(aircraft.get())}</div>
      </div>

      <div class="flex flex-row border-b-2 border-solid border-redis-dusk py-3">
        <div class="flex-1 text-left">Last Updated</div>
        <div class="flex-1 text-right">{AircraftStatus.displayLastUpdatedTime(aircraft.get())}</div>
      </div>
    </div>
  {/if}
</div>
