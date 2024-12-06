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
        if (parsedMsg.type == "chat") {
            let currUsrRoom = null;
            for (let i = 0; i < allsocket.length; i++) {
                if (allsocket[i].socket == socket) {
                    currUsrRoom = allsocket[i].roomId;
                }
            }
            for (let i = 0; i < allsocket.length; i++) {
                if (allsocket[i].roomId == currUsrRoom) {
                    allsocket[i].socket.send(parsedMsg.payload.message);
                }
            }
        }
    });
});
