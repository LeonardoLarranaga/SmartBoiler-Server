import WebSocket, { Server } from "ws"

const boilers = new Map<string, BoilerConnection>()
const apps = new Map<string, AppConnection>()

// MARK: Connections/Messages

export function processMessage(message: Message, ws: WebSocket) {
    switch (message.type) {
        case "boiler_init":
            handleBoilerInit(message, ws)
            break
        case "boiler_update":
            handleBoilerUpdate(message)
            break
        case "app_init":
            handleAppInit(message, ws)
            break
        case "command":
            handleCommand(message)
            break
    }
}

function handleBoilerInit(message: Message, ws: WebSocket) {
    const boilerId = message.boilerId
    const appId = message.appId
    const temperature = message.temperature
    const isOn = message.isOn

    if (!boilerId || !appId || temperature === undefined || isOn === undefined) {
        console.error("[Boiler Init] Invalid message:", message)
        return
    }
}

function handleBoilerUpdate(message: Message) {
    const boilerId = message.boilerId
    const temperature = message.temperature
    const isOn = message.isOn

    if (!boilerId || temperature === undefined || isOn === undefined) {
        console.error("[Boiler Update] Invalid message:", message)
        return
    }
}

function handleAppInit(message: Message, ws: WebSocket) {
    const appId = message.appId
    const boilerIds = message.boilerIds

    if (!appId || !boilerIds) {
        console.error("[App Init] Invalid message:", message)
        return
    }
}

function handleCommand(message: Message) {
    const appId = message.appId
    const boilerId = message.boilerId
    const action = message.action

    if (!appId || !boilerId || !action) {
        console.error("[Command] Invalid message:", message)
        return
    }
}

// MARK: Disconnections

export function processDisconnection(ws: WebSocket) {
}