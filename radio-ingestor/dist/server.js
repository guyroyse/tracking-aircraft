import { AIRCRAFT_STREAM_KEY, AIRCRAFT_STREAM_LIEFTIME } from './_config';
import { redis } from './redis-client';
import { SBS1_Client } from './sbs1-client';
const sbs1Client = SBS1_Client.create();
sbs1Client.registerHandler(async (event) => {
    /* find oldest event id to keep */
    const oldestEventId = new Date().getTime() - AIRCRAFT_STREAM_LIEFTIME * 1000;
    /* add the event to the stream, expiring old events */
    redis.xAdd(AIRCRAFT_STREAM_KEY, '*', event, {
        TRIM: {
            strategy: 'MINID',
            strategyModifier: '~',
            threshold: oldestEventId
        }
    });
});
