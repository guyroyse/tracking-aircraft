import { FLIGHT_SERVER_WS } from './config'

import { AircraftStatus } from './common/aircraft-status'
import { addOrUpdateAircraft, removeExpiredAircraft } from './stores/aircraft-store'

import App from './App.svelte'

const target = document.body
const app = new App({ target })

/* Handle incoming aircraft transponder events and update the store. */
let ws: WebSocket = new WebSocket(FLIGHT_SERVER_WS)
ws.onmessage = (event: MessageEvent) => {
  const receivedStatus = AircraftStatus.fromJSON(event.data)
  addOrUpdateAircraft(receivedStatus)
}

/* Set up the timer to expire aircraft in the store that we haven't heard from
   in a while. */
setInterval(removeExpiredAircraft, 5000)

export default app
