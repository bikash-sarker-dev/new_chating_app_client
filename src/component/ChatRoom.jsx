import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");
const ChatRoom = ({ username, room }) => {
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState("");
  const [messages, setMessages] = useState([]);

  const endMsgShow = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      const messageReady = {
        room,
        message,
        author: username,
        date: new Date().toLocaleDateString(),
        id: crypto.randomUUID(),
      };
      socket.emit("send_message", messageReady);
      // Show message instantly
      setMessages((prev) => [...prev, messageReady]);
      //   setMessages([...messages, { text: message, user: username }]);
      setMessage("");
    }
  };

  useEffect(() => {
    endMsgShow.current?.scrollIntoView({ behavior: "smooth" });
  });
  useEffect(() => {
    socket.emit("join_room", room);
    socket.on("receive_message", (data) => {
      //   console.log(" server from data: ", data);
      setMessages((prev) => [...prev, data]);
    });

    socket.on("typing_user", (user) => {
      if (user === username) return;
      setTyping(`${user} is typing...........`);
      console.log("send to server typing: ", user);
      setTimeout(() => setTyping(""), 2000);
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing_user");
    };
  }, [room]);

  const typingHandle = () => {
    socket.emit("typing", { username, room });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      {/* Chat Header */}
      <div className="w-full max-w-xl bg-white shadow-md rounded-xl p-4 mb-4">
        <h1 className="text-lg font-bold text-gray-700">
          Room: <span className="text-blue-600">{room}</span>
        </h1>
        <p className="text-sm text-gray-500">Logged in as {username}</p>
      </div>

      {/* Chat Box */}
      <div className="w-full max-w-xl bg-white shadow-md rounded-xl flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.author === username ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-xs text-sm shadow-sm ${
                  msg.author === username
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}

          <div ref={endMsgShow}></div>
        </div>
        <p>{typing}</p>
        {/* Input Bar */}
        <div className="flex items-center gap-3 p-3 border-t bg-white">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              typingHandle();
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
