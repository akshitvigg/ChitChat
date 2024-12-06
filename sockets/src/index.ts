import { WebSocketServer, WebSocket } from "ws";

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
