<script lang="ts">
  import { AircraftStatus } from '../../common/aircraft-status'
  import { aircraftStore } from '../../stores/aircraft-store'

  let sortColumn: keyof AircraftStatus = 'icaoId'
  let sortDirection: 'asc' | 'desc' = 'asc'

  function sortData(data: Map<string, AircraftStatus>) {
    return Array.from(data.values()).sort((a, b) => {
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

  function sortTable(column: keyof AircraftStatus) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn = column
      sortDirection = 'asc'
    }
  }
</script>

<div class="w-full text-3xl px-48 py-12">
  {#if $aircraftStore.size === 0}
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
            <td class="text-left py-2">{@html aircraft.linkIcao}</td>
            <td class="text-left">{@html aircraft.linkCallsign}</td>
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
