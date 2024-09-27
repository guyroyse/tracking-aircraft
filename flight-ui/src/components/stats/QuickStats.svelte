<script lang="ts">
  import { statsStore } from '../../stores/stats-store'
  import { AircraftStatus } from '../../common/aircraft-status'
</script>

<aside class="flex-1 text-right">
  Received {AircraftStatus.displayNumber($statsStore.messagesReceived)} messages and spotted {AircraftStatus.displayNumber(
    $statsStore.aircraftSpotted
  )} aircraft
</aside>
