import WebSocket from "ws"
import { AppConnection, BoilerConnection, Message } from "./types"

const MAX_TEMPERATURE = 45
const MIN_TEMPERATURE = 25

const boilers = new Map<string, BoilerConnection>()
const apps = new Map<string, AppConnection>()

// MARK: Connections/Messages

export function processMessage(message: Message, ws: WebSocket) {
    switch (message.type) {
        case "boiler_init":
            processBoilerInit(message, ws)
            break
        case "boiler_update":
            processBoilerUpdate(message, ws)
            break
        case "app_init":
            processAppInit(message, ws)
            break
        case "command":
            processCommand(message)
            break
    }
}

/**
 * Adds a new boiler to the list of connected boilers.
 * If the boiler already exists, it updates the existing entry.
 * @param message A message from the boiler
 * @param ws The WebSocket connection to the boiler
 */
function processBoilerInit(message: Message, ws: WebSocket) {
    const boilerId = message.boilerId
    const appId = message.appId
    const temperature = message.temperature
    const isOn = message.isOn

    if (!ws || !boilerId || !appId || temperature === undefined || isOn === undefined) {
        console.error("[Boiler Init] Invalid message:", message)
        return
    }

    if (boilers.has(boilerId)) {
        processBoilerUpdate(message, ws)
        return
    }

    boilers.set(boilerId, {
        isConnected: false,
        appId: appId,
        temperature: temperature,
        isOn: isOn,
        lastSeen: Date.now(),
        socket: ws
    })

    console.log("[Boiler Init] Boiler added:", boilerId)
}

/**
 * Updates the boiler's state in the list of connected boilers.
 * This is called when the boiler sends an update message.
 * After updating the state, the server sends the updated state to all connected apps.
 * @param message A message from the boiler
 */
function processBoilerUpdate(message: Message, ws: WebSocket) {
    const boilerId = message.boilerId
    const temperature = message.temperature
    const isOn = message.isOn

    if (!boilerId || temperature === undefined || isOn === undefined) {
        console.error("[Boiler Update] Invalid message:", message)
        return
    }

    const boiler = boilers.get(boilerId)
    if (!boiler) {
        console.error("[Boiler Update] Boiler not found:", boilerId)
        return
    }
    boiler.temperature = temperature
    boiler.isOn = isOn
    boiler.lastSeen = Date.now()
    boiler.socket = ws
    boiler.isConnected = true

    for (const app of apps.values()) {
        if (app.boilerIds.includes(boilerId)) {
            app.socket.send(JSON.stringify({
                type: "boiler_update",
                boilerId: boilerId,
                temperature: temperature,
                isOn: isOn
            }))
            break
        }
    }

    console.log("[Boiler Update] Boiler updated:", boilerId)
}

/**
 * Adds a new app to the list of connected apps.
 * @param message A message from the app
 * @param ws The WebSocket connection to the app
 */
function processAppInit(message: Message, ws: WebSocket) {
    const appId = message.appId
    const boilerIds = message.boilerIds

    if (!appId || !boilerIds) {
        console.error("[App Init] Invalid message:", message)
        return
    }

    apps.set(appId, {
        socket: ws,
        boilerIds: boilerIds
    })
}

/**
 * Processes a command from the app to control the boiler.
 * The command can be to turn on/off the boiler or set its temperature.
 * @param message A message from the app
 */
function processCommand(message: Message) {
    const appId = message.appId
    const boilerId = message.boilerId
    const action = message.action

    if (!appId || !boilerId || !action) {
        console.error("[Command] Invalid message:", message)
        return
    }

    const boiler = boilers.get(boilerId)
    if (!boiler) {
        console.error("[Command] Boiler not found:", boilerId)
        return
    }
    if (!boiler.isConnected) {
        console.error("[Command] Boiler not connected:", boilerId)
        return
    }

    switch (action) {
        case "turn_on":
            boiler.isOn = true
            break
        case "turn_off":
            boiler.isOn = false
            break
        case "set_temperature":
            const temperature = message.temperature
            if (temperature === undefined) {
                console.error("[Command] Invalid temperature:", message)
                return
            }
            if (temperature < MIN_TEMPERATURE || temperature > MAX_TEMPERATURE) {
                console.error("[Command] Temperature out of range:", boilerId, temperature)
                return
            }
            boiler.temperature = temperature
            break
        default:
            console.error("[Command] Invalid action:", action)
            return
    }

    boiler.socket.send(JSON.stringify({
        type: "boiler_update",
        boilerId: boilerId,
        temperature: boiler.temperature,
        isOn: boiler.isOn
    }))

    console.log("[Command] Command processed:", action, boilerId)
}

// MARK: Disconnections

export function processDisconnection(ws: WebSocket) {
    for (const [boilerId, boiler] of boilers.entries()) {
        if (boiler.socket === ws) {
            processBoilerDisconnection(boilerId);
            return;
        }
    }

    for (const [appId, app] of apps.entries()) {
        if (app.socket === ws) {
            processAppDisconnection(appId);
            return;
        }
    }
}

/**
 * Processes the disconnection of a boiler.
 * When a boiler is disconnected, it is not removed from the list of connected boilers.
 * Instead, its state is updated to indicate that it is no longer connected.
 * This allows the server to keep track of the last known state of the boiler.
 * The server also sends a message to all connected apps to inform them of the disconnection.
 * @param boilerId The ID of the disconnected boiler
 */
function processBoilerDisconnection(boilerId: string) {
    const boiler = boilers.get(boilerId)
    if (!boiler) {
        console.error("[Disconnection] Boiler not found:", boilerId)
        return
    }

    boiler.isConnected = false
    boiler.socket.terminate()
    boiler.lastSeen = Date.now()

    for (const app of apps.values()) {
        if (app.boilerIds.includes(boilerId)) {
            app.socket.send(JSON.stringify({
                type: "boiler_update",
                boilerId: boilerId,
                temperature: boiler.temperature,
                isOn: boiler.isOn,
                isConnected: false
            }))
            break
        }
    }

    console.log("[Disconnection] Boiler disconnected:", boilerId)
}

/**
 * Processes the disconnection of an app.
 * When an app is disconnected, it is removed from the list of connected apps.
 * @param appId The ID of the disconnected app
 */
function processAppDisconnection(appId: string) {
    const app = apps.get(appId)
    if (!app) {
        console.error("[Disconnection] App not found:", appId)
        return
    }
    app.socket.terminate()
    apps.delete(appId)

    console.log("[Disconnection] App disconnected:", appId)
}