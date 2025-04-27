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
}

function processBoilerUpdate(message: Message) {
    const boilerId = message.boilerId
    const temperature = message.temperature
    const isOn = message.isOn

    if (!boilerId || temperature === undefined || isOn === undefined) {
        console.error("[Boiler Update] Invalid message:", message)
        return
    }
}

function processAppInit(message: Message, ws: WebSocket) {
    const appId = message.appId
    const boilerIds = message.boilerIds

    if (!appId || !boilerIds) {
        console.error("[App Init] Invalid message:", message)
        return
    }
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