interface BoilerConnection {
    appId: string,
    temperature: number,
    isOn: boolean,
    lastSeen: Date,
    socket: WebSocket
}

interface AppConnection {
    socket: WebSocket,
    boilerIds: string[]
}

type Message = 
    | {
        type: "boiler_init",
        boilerId: string,
        appId: string,
        temperature: number,
        isOn: boolean
    } | {
        type: "boiler_update",
        boilerId: string,
        temperature: number,
        isOn: boolean
    } | {
        type: "app_init",
        appId: string,
        boilerIds: string[]
    } | {
        type: "command",
        appId: string,
        boilerId: string,
        action: | "turn_on" | "turn_off" | "set_temperature",
        temperature?: number
    }