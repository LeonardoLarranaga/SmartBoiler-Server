"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_ws_1 = __importDefault(require("express-ws"));
const processing_1 = require("./processing");
const server = (0, express_1.default)();
const websocket = (0, express_ws_1.default)(server);
server.get("/", (_, res) => {
    res.send("SmartBoiler-KiLL Server is running");
});
websocket.app.ws("/socket", (socket, _) => {
    console.log("[Server] New connection established");
    socket.on("message", (data) => (0, processing_1.processMessage)(JSON.parse(data.toString()), socket));
    socket.on("close", () => (0, processing_1.processDisconnection)(socket));
    socket.on("error", () => (0, processing_1.processDisconnection)(socket));
});
server.listen(8080, () => console.log("[Server] WebSocket server is running on port 8080."));
exports.default = server;
//# sourceMappingURL=server.js.map