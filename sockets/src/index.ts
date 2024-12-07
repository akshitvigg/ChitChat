import { WebSocketServer, WebSocket } from "ws";
import { random } from "./utils";

interface Users {
  socket: WebSocket;
  roomId: string;
}

let allsocket: Users[] = [];

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    let parsedMsg = JSON.parse(message as unknown as string);
    if (parsedMsg.type == "join") {
      allsocket.push({
        socket,
        roomId: parsedMsg.payload.roomId,
      });
    }

    if (parsedMsg.type === "chat") {
      const currUser = allsocket.find((x) => x.socket == socket);
      allsocket.map((e) => {
        if (e.roomId == currUser?.roomId) {
          e.socket.send(
            JSON.stringify({
              name: parsedMsg.payload.name,
              message: parsedMsg.payload.message,
            })
          );
        }
      });
    }
  });
});
