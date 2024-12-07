import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Copy } from "lucide-react";

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
      <ToastContainer
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
      />

      {!connected ? (
        <div className="mt-32 border rounded-xl border-neutral-800 h-[380px] w-80 sm:w-[600px] ">
          <div className=" pt-5">
            <p className="sm:text-3xl text-2xl font-bold sm:pl-10 pl-5">
              Welcome to ChitChat
            </p>
          </div>
          <div className="pt-10 sm:pl-10 pl-5">
            <button
              onClick={createRoom}
              className=" font-bold justify-center transition-all duration-300 hover:bg-gray-300 active:scale-105 bg-white text-black p-3 w-72 sm:w-[520px]  rounded-md"
            >
              Create a room
            </button>
          </div>
          <div className="flex items-center my-4">
            <div className="flex-1 ml-5 sm:ml-10  border-t border-[#4e4e4e]"></div>
            <span className="px-4 text-[#4e4e4e]">or</span>
            <div className="flex-1 mr-5 sm:mr-10 border-t border-[#4e4e4e]"></div>
          </div>

          <div className="flex justify-center pt-4 ">
            <div className="sm:pl-0 pl-64">
              <input
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent outline-none w-[280px] sm:w-[520px] rounded-lg p-3 border border-neutral-700"
                type="text"
                placeholder="Enter your name"
              />

              <div className="flex sm:pr-0 pr-64">
                <input
                  onChange={(e) => setRoomid(e.target.value)}
                  className="mt-5 border w-[200px] outline-none border-neutral-700 block p-3 sm:w-[435px] rounded-lg bg-transparent"
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
          <div className="h-[95vh] border w-[600px] rounded-xl border-neutral-700">
            <div>
              <p className="text-3xl pl-10 pt-4 font-bold">ChitChat</p>
              <p className="   text-neutral-400 tracking-wider font-medium mt-5 p-4 rounded-xl bg-[#262626] ml-5 mr-5">
                {" "}
                Room id:{" "}
                <span className=" font-bold">
                  {localStorage.getItem("roomID")}{" "}
                  <span className=" ml-1 ">
                    <button
                      onClick={() => {
                        const id = localStorage.getItem("roomID");
                        if (!id) return;
                        navigator.clipboard.writeText(id);
                        toast.success("copied to clipboard");
                      }}
                    >
                      <Copy size={18} />
                    </button>
                  </span>
                </span>
              </p>
              <div className="flex justify-center">
                <div className="h-[60vh] w-[550px] rounded-xl mt-10 border border-neutral-700 overflow-y-scroll">
                  {messages.map((m, index) => {
                    const isMymsg = localStorage.getItem("name") === m.name;
                    return (
                      <div
                        key={index}
                        className={`flex flex-col mt-3 mr-3 ml-3 ${
                          isMymsg ? "items-end" : "items-start"
                        }`}
                      >
                        <div className="text-xs mr-2 ml-2  text-gray-400 mb-1">
                          {m.name}
                        </div>
                        <div
                          className={`p-3  bg-[#161616] border-[#3e3e3e] border-[1px] max-w-[80%] rounded-lg overscroll-auto ${
                            isMymsg ? "bg-blue-500/10 border-blue-500/20" : ""
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
                  className="ml-2 font-semibold border bg-white text-black p-2 rounded-md px-8"
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
