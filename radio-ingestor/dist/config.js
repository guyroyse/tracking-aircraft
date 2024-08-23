import 'dotenv/config';
export const sbs1Host = process.env['SBS1_SOURCE_HOST'] ?? 'localhost';
export const sbs1Port = Number(process.env['SBS1_SOURCE_PORT'] ?? 30003);
export const redisHost = process.env['REDIS_HOST'] ?? 'localhost';
export const redisPort = Number(process.env['REDIS_PORT'] ?? 6379);
export const redisPassword = process.env['REDIS_PASSWORD'];
export const streamKey = process.env['STREAM_KEY'] ?? 'radio:events';
export const streamLifetime = Number(process.env['STREAM_LIFETIME'] ?? 3600);
export const radioId = process.env['RADIO_ID'] ?? 'radio:unknown';
