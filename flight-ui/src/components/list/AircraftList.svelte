<script lang="ts">
  import { AircraftStatus } from '../../common/aircraft-status'
  import type { AircraftStatusData } from '../../common/aircraft-status'
  import { aircraftStore } from '../../stores/aircraft-store'
  import type { AircraftStatuses } from '../../stores/aircraft-store'

  import { sortDataStore } from '../../stores/sort-store'

  function sortData(data: AircraftStatuses): AircraftStatusData[] {
    const sortColumn = $sortDataStore.column
    const sortDirection = $sortDataStore.direction

    return Object.values(data).sort((a, b) => {
      if (sortColumn === 'icaoId' || sortColumn === 'callsign') {
        const aString = a[sortColumn] as string | null
        const bString = b[sortColumn] as string | null

        // sort nulls to the bottom
        if (aString === null && bString === null) return 0
        if (aString === null) return 1
        if (bString === null) return -1

        // sort the strings
        if (aString < bString) return sortDirection === 'asc' ? -1 : 1
        if (aString > bString) return sortDirection === 'asc' ? 1 : -1
        return 0
      } else {
        const aNumber = a[sortColumn] as number | null
        const bNumber = b[sortColumn] as number | null

        // sort nulls to the bottom
        if (aNumber === null && bNumber === null) return 0
        if (aNumber === null) return 1
        if (bNumber === null) return -1

        // sort the numbers
        if (aNumber < bNumber) return sortDirection === 'asc' ? -1 : 1
        if (aNumber > bNumber) return sortDirection === 'asc' ? 1 : -1
        return 0
      }
    })
  }

  function sortTable(column: keyof AircraftStatusData) {
    $sortDataStore.column
    if ($sortDataStore.column === column) {
      $sortDataStore.direction = $sortDataStore.direction === 'asc' ? 'desc' : 'asc'
    } else {
      $sortDataStore.column = column
      $sortDataStore.direction = 'asc'
    }
  }

  function isEmpty(data: AircraftStatuses) {
    return Object.keys(data).length === 0
  }
</script>

<div class="w-full text-3xl px-48 py-12">
  {#if isEmpty($aircraftStore)}
    <p class="">No aircraft in the area.</p>
  {:else}
    <table class="table-auto w-full text-right font-mono">
      <thead>
        <tr class="border-b-2 border-redis-midnight hover:cursor-pointer">
          <th on:click="{() => sortTable('icaoId')}" class="text-left">ICAO</th>
          <th on:click="{() => sortTable('callsign')}" class="text-left">Flight</th>
          <th on:click="{() => sortTable('latitude')}">Latitude</th>
          <th on:click="{() => sortTable('longitude')}">Longitude</th>
          <th on:click="{() => sortTable('altitude')}">Altitude</th>
          <th on:click="{() => sortTable('heading')}">Heading</th>
          <th on:click="{() => sortTable('velocity')}">Velocity</th>
          <th on:click="{() => sortTable('climb')}">Climb</th>
          <th on:click="{() => sortTable('lastUpdated')}">Last Updated</th>
        </tr>
      </thead>
      <tbody>
        {#each sortData($aircraftStore) as aircraft}
          <tr class="even:bg-redis-light-gray">
            <td class="text-left py-2">{@html AircraftStatus.linkIcao(aircraft)}</td>
            <td class="text-left">{@html AircraftStatus.linkCallsign(aircraft)}</td>
            <td>{AircraftStatus.displayLatitude(aircraft)}</td>
            <td>{AircraftStatus.displayLongitude(aircraft)}</td>
            <td>{AircraftStatus.displayAltitude(aircraft)}</td>
            <td>{AircraftStatus.displayHeading(aircraft)}</td>
            <td>{AircraftStatus.displayVelocity(aircraft)}</td>
            <td>{AircraftStatus.displayClimb(aircraft)}</td>
            <td>{AircraftStatus.displayLastUpdatedTime(aircraft)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
