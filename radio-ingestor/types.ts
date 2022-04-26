export interface Message {
    message_type: MessageType;
    transmission_type: TransmissionType;
    session_id: string;
    aircraft_id: string;
    hex_ident: string;
    flight_id: string;
    generated_date: string;
    generated_time: string;
    logged_date: string;
    logged_time: string;
    callsign: string;
    altitude: number;
    ground_speed: number;
    track: number;
    lat: number;
    lon: number;
    vertical_rate: number;
    squawk: string;
    alert: boolean;
    emergency: boolean;
    spi: boolean;
    is_on_ground: boolean;
}

export enum MessageType {
    SELECTION_CHANGE = "SEL",
    NEW_ID = "ID",
    NEW_AIRCRAFT = "AIR",
    STATUS_AIRCRAFT = "STA",
    CLICK = "CLK",
    TRANSMISSION = "MSG"
}

export enum TransmissionType {
    ES_IDENT_AND_CATEGORY = 1,
    ES_SURFACE_POS = 2,
    ES_AIRBORNE_POS = 3,
    ES_AIRBORNE_VEL = 4,
    SURVEILLANCE_ALT = 5,
    SURVEILLANCE_ID = 6,
    AIR_TO_AIR = 7,
    ALL_CALL_REPLY = 8
}