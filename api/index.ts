import server from '../src/server'

server.listen(8080, () => console.log("[Server] WebSocket server is running on port 8080."))

export default server