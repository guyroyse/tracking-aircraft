import { Client } from 'sbs1';
import { AircraftEvent } from './aircraft-event';
export type SBS1_EventHandler = (event: AircraftEvent) => Promise<void>;
export declare class SBS1_Client {
    private client;
    private handlers;
    constructor(sbs1Client: Client);
    static create(): SBS1_Client;
    registerHandler(handler: SBS1_EventHandler): this;
    unregisterHandler(handler: SBS1_EventHandler): this;
    private bindMessage;
    private buildAircraftEvent;
    private toEpochMilliseconds;
    private toTransmissionType;
}
