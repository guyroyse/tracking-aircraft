import { Entity, Schema } from 'redis-om'
import { omClient } from './client.js'

class Flight extends Entity {}

const flightSchema = new Schema(Flight, {
  icaoId: { type: 'string' },
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

export const flightRepository = omClient.fetchRepository(flightSchema)
await flightRepository.createIndex()
