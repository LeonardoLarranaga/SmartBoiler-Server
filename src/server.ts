import express from "express"
import expressWs from "express-ws"
import { processDisconnection, processMessage } from "./processing"

const server = express()
const websocket = expressWs(server)
const port = process.env.PORT || 8080

server.get("/", (_, res) => {
    res.send("SmartBoiler-KiLL Server is running")
})

websocket.app.ws("/socket", (socket, _) => {
    console.log("[Server] New connection established")
    
    socket.on("message", (data) => processMessage(JSON.parse(data.toString()), socket))
    socket.on("close", () => processDisconnection(socket))
    socket.on("error", () => processDisconnection(socket))
})

server.listen(port, () => console.log(`[Server] WebSocket server is running on port ${port}.`))

export default server