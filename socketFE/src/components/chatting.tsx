import { useEffect, useRef, useState } from "react";

export const Chatting = () => {
  const webSocketRef = useRef();
  const [messages, setMessages] = useState<Messages[]>([]);
  const [username, setUsername] = useState<string>("");
  const [currMsg, setCurMsg] = useState<string>("");
  const [connected, setCon] = useState(false);

  const [roomid, setRoomid] = useState<string>("");

  interface Messages {
    name: string;
    message: string;
  }

  const sendMsg = () => {
    if (!webSocketRef.current) {
      return;
    }

    webSocketRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: {
          name: username,
          message: currMsg,
        },
      })
    );
    setCurMsg("");
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    //@ts-ignore
    webSocketRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const recievedMsg = JSON.parse(event.data);
        setMessages((old) => [...old, recievedMsg]);
        console.log(event.data);
      } catch (e) {
        console.log(e);
      }
    };
  }, []);

  function createRoom() {
    const chars = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ];

    let id = "";

    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      id += chars[randomIndex];
    }
    joinRoom(id);
  }

  const joinRoom = (roommid: string | undefined) => {
    if (!webSocketRef.current) {
      return;
    }

    const message = JSON.stringify({
      type: "join",
      payload: {
        roomId: roommid ? roommid : roomid,
      },
    });

    setCon(true);

    localStorage.setItem("roomID", roommid ? roommid : roomid);
    localStorage.setItem("name", username);

    webSocketRef.current.send(message);
  };

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && currMsg.trim() !== "") {
      sendMsg();
    }
  }

  return (
    <div className=" flex justify-center  text-white font-montserrat h-screen bg-black">
      {!connected ? (
        <div>
          <div className="pt-16 ">
            <p className="text-4xl">Welcome to ChitChat</p>
          </div>
          <div className=" flex justify-center pt-16">
            <div>
              <input
                onChange={(e) => setUsername(e.target.value)}
                className=" bg-slate-900 p-3"
                type="text"
                placeholder="enter your name "
              />

              <div className=" flex">
                <input
                  onChange={(e) => setRoomid(e.target.value)}
                  className=" mt-5 block p-3 bg-slate-900"
                  type="text"
                  placeholder="enter room id "
                />
                <button
                  onClick={() => joinRoom(roomid)}
                  className=" bg-slate-800  px-5 ml-3 "
                >
                  Join
                </button>
              </div>
              <div className=" gap-3 flex">
                <div className=" border-t mt-3 w-32"></div>
                <p>or</p>
                <div className=" border-t mt-3 w-32"></div>
              </div>
              <div className=" flex justify-center pt-10">
                <button
                  onClick={createRoom}
                  className=" justify-center bg-rose-700 p-3 px-16 rounded-md"
                >
                  Create a room
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-5 flex justify-center">
          <div className="h-[95vh] border w-[600px] rounded-lg border-neutral-700 ">
            <div>
              <p className=" text-3xl">
                Real Time Chat room id: {localStorage.getItem("roomID")}{" "}
              </p>
              <div className="flex justify-center">
                <div className=" h-[60vh] w-[550px] rounded-lg mt-32 border border-neutral-700 overflow-y-scroll  ">
                  {messages.map((m, index) => {
                    const isMymsg = localStorage.getItem("name") == m.name;
                    return (
                      <div
                        key={index}
                        className={` flex flex-col ${
                          isMymsg ? "items-end" : "items-start"
                        }`}
                      >
                        <div className=" text-xs text-gray-400 mb-1">
                          {m.name}
                        </div>
                        <div
                          className={`p-3 bg-[#161616] border-[#3e3e3e] border-[1px] max-w-[80%] rounded-lg overscroll-auto ${
                            isMymsg ? "bg-red-500/10 border-red-500/20" : ""
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className=" pl-6 pt-6">
                <input
                  onKeyDown={handleKeyPress}
                  onChange={(e) => setCurMsg(e.target.value)}
                  className=" outline-none  w-[443px] p-2 bg-transparent border border-neutral-700 rounded-md"
                  type="text"
                  placeholder="Type your message..."
                  required={true}
                />
                <button
                  onClick={sendMsg}
                  className=" ml-2 borde bg-white text-black p-2 rounded-md px-8"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
