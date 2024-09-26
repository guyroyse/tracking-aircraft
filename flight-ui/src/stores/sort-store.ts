import { writable } from 'svelte/store'

import type { AircraftStatusData } from '../common/aircraft-status'

type SortData = {
  column: keyof AircraftStatusData
  direction: 'asc' | 'desc'
}

const sortData: SortData = {
  column: 'icaoId',
  direction: 'asc'
}

const sortDataStore = writable(sortData)

function updateSortData(column: keyof AircraftStatusData, direction: 'asc' | 'desc') {
  sortDataStore.set({ column, direction })
}

export type { SortData }
export { sortDataStore, updateSortData }
