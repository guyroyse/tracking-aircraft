import { Entity, Schema } from 'redis-om'
import { omClient } from './client.js'

class AircraftStatus extends Entity {}

const aircraftSchema = new Schema(AircraftStatus, {
  icacoId: { type: 'string' },
  dateTime: { type: 'date' },
  radio: { type: 'string' },
  callsign: { type: 'string' },
  altitude: { type: 'number' },
  latitude: { type: 'number' },
  longitude: { type: 'number' },
  location: { type: 'point' },
  velocity: { type: 'number' },
  heading: { type: 'number' },
  climb: { type: 'number' },
  onGround: { type: 'boolean' }
})

export const aircraftRepository = omClient.fetchRepository(aircraftSchema)
await aircraftRepository.createIndex()
