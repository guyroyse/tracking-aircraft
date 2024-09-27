<script lang="ts">
  import { AircraftStatus } from '../../common/aircraft-status'
  import { statsStore } from '../../stores/stats-store'
</script>

<div class="w-full text-3xl px-48 py-24">
  <div class="flex flex-col w-full font-mono text-3xl">
    <div class="flex flex-row border-b-2 border-solid border-redis-dusk py-3">
      <div class="flex-1"></div>
      <div class="flex-1 text-right">Mean</div>
      <div class="flex-1 text-right">Median</div>
      <div class="flex-1 text-right">p90</div>
      <div class="flex-1 text-right">p95</div>
      <div class="flex-1 text-right">p99</div>
      <div class="flex-shrink text-left pl-8">&nbsp;&nbsp;</div>
    </div>
    <div class="flex flex-row border-b-2 border-dotted border-redis-dusk py-3">
      <div class="flex-1 text-left">Velocity</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.velocity.mean)}</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.velocity.median)}</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.velocity.p90)}</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.velocity.p95)}</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.velocity.p99)}</div>
      <div class="flex-shrink text-left pl-8">kn</div>
    </div>
    <div class="flex flex-row border-b-2 border-dotted border-redis-dusk py-3">
      <div class="flex-1 text-left">Altitude</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.altitude.mean)}</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.altitude.median)}</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.altitude.p90)}</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.altitude.p95)}</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.altitude.p99)}</div>
      <div class="flex-shrink text-left pl-8">ft</div>
    </div>
    <div class="flex flex-row border-b-2 border-solid border-redis-dusk py-3">
      <div class="flex-1 text-left">Climb</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.climb.mean)}</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.climb.median)}</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.climb.p90)}</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.climb.p95)}</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.climb.p99)}</div>
      <div class="flex-shrink text-left pl-8">ft</div>
    </div>
    <div class="flex flex-row border-b-2 border-dotted border-redis-dusk py-3">
      <div class="flex-1 text-left">Aircraft Spotted</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.aircraftSpotted)}</div>
      <div class="flex-shrink text-left pl-8">&nbsp;&nbsp;</div>
    </div>
    <div class="flex flex-row border-b-2 border-solid border-redis-dusk py-3">
      <div class="flex-1 text-left">Messages Recevied</div>
      <div class="flex-1 text-right">{AircraftStatus.displayNumber($statsStore.messagesReceived)}</div>
      <div class="flex-shrink text-left pl-8">&nbsp;&nbsp;</div>
    </div>
  </div>
</div>
