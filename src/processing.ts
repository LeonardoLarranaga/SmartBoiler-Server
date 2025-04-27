import WebSocket from "ws"
import { AppConnection, BoilerConnection, Message } from "./types"

const boilers = new Map<string, BoilerConnection>()
const apps = new Map<string, AppConnection>()

// MARK: Connections/Messages

export function processMessage(message: Message, ws: WebSocket) {
    switch (message.type) {
        case "boiler_init":
            processBoilerInit(message, ws)
            break
        case "boiler_update":
            processBoilerUpdate(message)
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
        processBoilerUpdate(message)
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
function processBoilerUpdate(message: Message) {
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

function processCommand(message: Message) {
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