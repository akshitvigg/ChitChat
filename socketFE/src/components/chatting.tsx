import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Chatting = () => {
  const webSocketRef = useRef<WebSocket | null>(null);
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

    if (currMsg.trim() === "") {
      toast.warning("Message cannot be empty");
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
    webSocketRef.current = ws;

    ws.onopen = () => {
      toast.info("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const receivedMsg = JSON.parse(event.data);
        setMessages((old) => [...old, receivedMsg]);
      } catch (e) {
        toast.error("Error parsing message");
        console.log(e);
      }
    };

    ws.onerror = () => {
      toast.error("WebSocket connection error");
    };

    ws.onclose = () => {
      toast.warning("WebSocket connection closed");
    };

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, []);

  function createRoom() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "";

    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      id += chars[randomIndex];
    }
    joinRoom(id);
  }

  const joinRoom = (roommid?: string) => {
    if (!webSocketRef.current) {
      toast.error("WebSocket not connected");
      return;
    }

    if (!username.trim()) {
      toast.warning("Please enter a username");
      return;
    }

    const roomToJoin = roommid || roomid;

    if (!roomToJoin.trim()) {
      toast.warning("Please enter a Room ID");
      return;
    }

    const message = JSON.stringify({
      type: "join",
      payload: {
        roomId: roomToJoin,
      },
    });

    setCon(true);

    localStorage.setItem("roomID", roomToJoin);
    localStorage.setItem("name", username);
    webSocketRef.current.send(message);
    toast.success(`Joined Room: ${roomToJoin}`);
  };

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && currMsg.trim() !== "") {
      sendMsg();
    }
  }

  return (
    <div className="flex justify-center  text-white font-montserrat h-screen bg-black">
      {/* <ToastContainer
        position="top-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      /> */}

      {!connected ? (
        <div className="mt-32 border rounded-xl border-neutral-800 h-80 w-[600px] ">
          <div className=" pt-5">
            <p className="text-3xl font-bold pl-10">Welcome to ChitChat</p>
          </div>
          <div className="pt-10 pl-10">
            <button
              onClick={createRoom}
              className=" font-bold justify-center transition-all duration-300 hover:bg-gray-300 active:scale-105 bg-white text-black p-3 w-[520px]  rounded-md"
            >
              Create a room
            </button>
          </div>

          <div className="flex justify-center pt-4 ">
            <div>
              <input
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent w-[520px] rounded-lg p-3 border border-neutral-700"
                type="text"
                placeholder="Enter your name"
              />

              <div className="flex">
                <input
                  onChange={(e) => setRoomid(e.target.value)}
                  className="mt-5 border border-neutral-700 block p-3 w-[435px] rounded-lg bg-transparent"
                  type="text"
                  placeholder="Enter room ID"
                />
                <button
                  onClick={() => joinRoom()}
                  className="font-bold rounded-lg transition-all duration-300 hover:bg-gray-300 active:scale-110 bg-white text-black px-5 ml-2 mt-5"
                >
                  Join
                </button>
              </div>

              <div className="flex justify-center pt-10"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-5 flex justify-center">
          <div className="h-[95vh] border w-[600px] rounded-lg border-neutral-700">
            <div>
              <p className="text-3xl">
                Real Time Chat room id: {localStorage.getItem("roomID")}{" "}
              </p>
              <div className="flex justify-center">
                <div className="h-[60vh] w-[550px] rounded-lg mt-32 border border-neutral-700 overflow-y-scroll">
                  {messages.map((m, index) => {
                    const isMymsg = localStorage.getItem("name") === m.name;
                    return (
                      <div
                        key={index}
                        className={`flex flex-col ${
                          isMymsg ? "items-end" : "items-start"
                        }`}
                      >
                        <div className="text-xs text-gray-400 mb-1">
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
              <div className="pl-6 pt-6">
                <input
                  value={currMsg}
                  onKeyDown={handleKeyPress}
                  onChange={(e) => setCurMsg(e.target.value)}
                  className="outline-none w-[443px] p-2 bg-transparent border border-neutral-700 rounded-md"
                  type="text"
                  placeholder="Type your message..."
                  required={true}
                />
                <button
                  onClick={sendMsg}
                  className="ml-2 border bg-white text-black p-2 rounded-md px-8"
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
