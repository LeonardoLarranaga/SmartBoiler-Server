import { Server } from "ws"
import { processDisconnection, processMessage } from "./processing"

const server = new Server({ port: 8080 })

server.on("connection", (socket) => {
    console.log("[Server] New connection established")
    socket.on("message", (data) => processMessage(JSON.parse(data.toString()), socket))
    socket.on("close", () => processDisconnection(socket))
})

console.log("[Server] WebSocket server is running on ws://localhost:8080")