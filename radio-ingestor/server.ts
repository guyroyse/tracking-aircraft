import 'dotenv/config'
//@ts-expect-error Types do not exist for the sbs1 lib
import * as sbs1 from 'sbs1';
import * as redis from 'redis';
import { Message } from "./types";

const host = process.env['DUMP_1090_HOST'];
const port = Number(process.env['DUMP_1090_PORT']);
const streamKey = process.env['STREAM_KEY'] ?? 'radio:1';

const sbs1Client = sbs1.createClient({ host, port });
const redisClient = redis.createClient();

redisClient.on('error', (err) => console.log('Redis Client Error', err));
await redisClient.connect();

sbs1Client.on('message', (msg: Message) => {
  const aircraftId = msg.hex_ident
  const minId = new Date().getTime() - 30 * 60 * 1000

  // Apparently only objects with string attributes can be a msg (?)
  redisClient.xAdd(streamKey, '*', <any>msg, {
    // Ask Leibale to export the types pls 
    TRIM: {
      strategy: 'MINID',
      strategyModifier: '~',
      threshold: minId
    }
  });
  redisClient.xAdd(`${streamKey}:${aircraftId}`, '*', <any>msg, {
    TRIM: {
      strategy: 'MINID',
      strategyModifier: '~',
      threshold: minId
    }
  });
  redisClient.sAdd(`${streamKey}:aircraft`, aircraftId);
})
