import { streamKey, streamLifetime, radioId } from './config';
import { sbs1Client } from './sbs1-client';
import { redis } from './redis-client';
// await messages
sbs1Client.on('message', sbs1Message => {
    // filter out null message types
    if (sbs1Message.message_type === null)
        return;
    // build event message
    const event = buildEventMessage(sbs1Message);
    // write the event to redis
    writeMessageToRedis(event);
});
function buildEventMessage(sbs1Message) {
    const eventMessage = {
        radio: radioId,
        icaoId: sbs1Message.hex_ident,
        type: toTransmissionType(sbs1Message.transmission_type),
        generatedDateTime: toEpochMilliseconds(sbs1Message.generated_date, sbs1Message.generated_time).toString(),
        loggedDateTime: toEpochMilliseconds(sbs1Message.logged_date, sbs1Message.logged_time).toString()
    };
    if (sbs1Message.callsign !== null)
        eventMessage.callsign = sbs1Message.callsign.trim();
    if (sbs1Message.altitude !== null)
        eventMessage.altitude = sbs1Message.altitude.toString();
    if (sbs1Message.lat !== null)
        eventMessage.latitude = sbs1Message.lat.toString();
    if (sbs1Message.lon !== null)
        eventMessage.longitude = sbs1Message.lon.toString();
    if (sbs1Message.ground_speed !== null)
        eventMessage.velocity = sbs1Message.ground_speed.toString();
    if (sbs1Message.track !== null)
        eventMessage.heading = sbs1Message.track.toString();
    if (sbs1Message.vertical_rate !== null)
        eventMessage.climb = sbs1Message.vertical_rate.toString();
    if (sbs1Message.is_on_ground !== null)
        eventMessage.onGround = sbs1Message.is_on_ground.toString();
    return eventMessage;
}
function writeMessageToRedis(event) {
    // find oldest event id to keep
    const oldestEventId = new Date().getTime() - streamLifetime * 1000;
    // add the event to the stream, expiring old events
    redis.xAdd(streamKey, '*', event, {
        TRIM: {
            strategy: 'MINID',
            strategyModifier: '~',
            threshold: oldestEventId
        }
    });
}
function toEpochMilliseconds(dateString, timeString) {
    if (dateString && timeString) {
        const offset = new Date().getTimezoneOffset() * 60 * 1000;
        const date = new Date(`${dateString.replaceAll('/', '-')}T${timeString}`);
        return date.getTime() - offset;
    }
    return 0;
}
function toTransmissionType(type) {
    return ([
        'ES_IDENT_AND_CATEGORY',
        'ES_SURFACE_POS',
        'ES_AIRBORNE_POS',
        'ES_AIRBORNE_VEL',
        'SURVEILLANCE_ALT',
        'SURVEILLANCE_ID',
        'AIR_TO_AIR',
        'ALL_CALL_REPLY'
    ][type - 1] ?? 'UNKNOWN');
}
