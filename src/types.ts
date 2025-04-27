import WebSocket from 'ws'

export interface BoilerConnection {
    isConnected: boolean,
    appId: string,
    temperature: number,
    currentTemperature: number,
    isOn: boolean,
    lastSeen: number,
    socket: WebSocket
}

export interface AppConnection {
    socket: WebSocket,
    boilerIds: string[]
}

export interface Message {
    type: "boiler_init" | "boiler_update" | "app_init" | "command",
    boilerId?: string,
    appId?: string,
    temperature?: number,
    currentTemperature?: number,
    isOn?: boolean,
    action?: "turn_on" | "turn_off" | "set_temperature",
    boilerIds?: string[]
}

// type Message = 
//     | {
//         type: "boiler_init",
//         boilerId: string,
//         appId: string,
//         temperature: number,
//         isOn: boolean
//     } | {
//         type: "boiler_update",
//         boilerId: string,
//         temperature: number,
//         isOn: boolean
//     } | {
//         type: "app_init",
//         appId: string,
//         boilerIds: string[]
//     } | {
//         type: "command",
//         appId: string,
//         boilerId: string,
//         action: | "turn_on" | "turn_off" | "set_temperature",
//         temperature?: number
//     }