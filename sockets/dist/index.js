"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
let allsocket = [];
const wss = new ws_1.WebSocketServer({ port: 8080 });
wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        let parsedMsg = JSON.parse(message);
        if (parsedMsg.type == "join") {
            allsocket.push({
                socket,
                roomId: parsedMsg.payload.roomId,
            });
        }
        if (parsedMsg.type === "chat") {
            const currUser = allsocket.find((x) => x.socket == socket);
            allsocket.map((e) => {
                if (e.roomId == (currUser === null || currUser === void 0 ? void 0 : currUser.roomId)) {
                    e.socket.send(JSON.stringify({
                        name: parsedMsg.payload.name,
                        message: parsedMsg.payload.message,
                    }));
                }
            });
        }
    });
});
