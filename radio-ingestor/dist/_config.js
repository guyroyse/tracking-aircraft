import 'dotenv/config';
/* SBS1 source options */
export const SBS1_HOST = process.env['SBS1_HOST'] ?? 'localhost';
export const SBS1_PORT = Number(process.env['SBS1_PORT'] ?? 30003);
/* Redis connection options */
export const REDIS_HOST = process.env['REDIS_HOST'] ?? 'localhost';
export const REDIS_PORT = Number(process.env['REDIS_PORT'] ?? 6379);
export const REDIS_PASSWORD = process.env['REDIS_PASSWORD'];
export const AIRCRAFT_STREAM_KEY = process.env['AIRCRAFT_STREAM_KEY'] ?? 'radio:events';
export const AIRCRAFT_STREAM_LIEFTIME = Number(process.env['AIRCRAFT_STREAM_LIEFTIME'] ?? 3600);
export const RADIO_ID = process.env['RADIO_ID'] ?? 'radio:unknown';
