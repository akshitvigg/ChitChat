import { useEffect, useRef, useState } from "react";

export const Chatting = () => {
  const webSocketRef = useRef();
  const [messages, setMessages] = useState([]);
  const inputRef = useRef();

  const sendMsg = () => {
    const sendingmsg = inputRef.current?.value.trim();

    if (!sendingmsg) {
      return;
    }
    //@ts-ignore
    setMessages((oldmsgs) => [...oldmsgs, { text: sendingmsg, type: "sent" }]);

    //@ts-ignore
    webSocketRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: sendingmsg,
        },
      })
    );
    inputRef.current.value = "";
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    //@ts-ignore
    webSocketRef.current = ws;

    ws.onmessage = (event) => {
      const recievedMessage = event.data;
      //@ts-ignore
      setMessages((prev) => [
        ...prev,
        { text: recievedMessage, type: "recieved" },
      ]);
    };

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            roomId: "123",
          },
        })
      );
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="  text-white font-montserrat min-h-screen bg-black">
      <div className="pt-5 flex justify-center">
        <div className="h-[95vh] border w-[600px] rounded-lg border-neutral-700 ">
          <div>
            <p className=" text-3xl">Real Time Chat</p>
            <div className="flex justify-center">
              <div className=" h-[60vh] w-[550px] rounded-lg mt-32 border border-neutral-700 overflow-y-scroll  ">
                {messages.map((m, index) => (
                  <div
                    key={index}
                    className={` mt-5 flex ${
                      m.type == "sent" ? " justify-end" : "justify-start"
                    }`}
                  >
                    <span
                      className={`mt-5 p-2 ml-2 mr-2 rounded-md ${
                        m.type == "sent"
                          ? " bg-blue-500  text-white"
                          : " bg-neutral-300 text-black"
                      }`}
                    >
                      {m.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className=" pl-6 pt-6">
              <input
                ref={inputRef}
                className=" outline-none  w-[443px] p-2 bg-transparent border border-neutral-700 rounded-md"
                type="text"
                placeholder="Type your message..."
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
    </div>
  );
};
