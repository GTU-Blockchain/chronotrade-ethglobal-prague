import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";

const AGENT_NAME = "ChronoBot";
    
const Chat = () => {
  const location = useLocation();
  const initialMessage = location.state?.initialMessage;
  const [messages, setMessages] = useState([
    {
      sender: AGENT_NAME,
      text: "Hi! I'm ChronoBot. How can I help you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const initialProcessed = useRef(false);

  // Helper to add agent loading message
  const addAgentLoading = () => {
    setMessages((msgs) => [
      ...msgs,
      {
        sender: AGENT_NAME,
        text: <span className="dot-typing" />,
        isLoading: true,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Helper to replace last agent loading message with real response
  const replaceAgentLoading = (responseText) => {
    setMessages((msgs) => {
      const idx = msgs.findIndex((m) => m.isLoading);
      if (idx === -1) return msgs;
      const newMsgs = [...msgs];
      newMsgs[idx] = {
        sender: AGENT_NAME,
        text: responseText,
        timestamp: new Date().toLocaleTimeString(),
      };
      return newMsgs;
    });
  };

  // Process initial message if present, only once
  useEffect(() => {
    if (initialMessage && !initialProcessed.current) {
      initialProcessed.current = true;
      const userMessage = {
        sender: "You",
        text: initialMessage,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((msgs) => [...msgs, userMessage]);
      addAgentLoading();
      setTimeout(() => {
        replaceAgentLoading(
          `You said: "${userMessage.text}". (Agent integration coming soon!)`
        );
      }, 1000);
    }
  }, [initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = {
      sender: "You",
      text: input,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput("");
    addAgentLoading();
    setTimeout(() => {
      replaceAgentLoading(
        `You said: "${userMessage.text}". (Agent integration coming soon!)`
      );
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[var(--color-background-dark)] text-black dark:text-white flex flex-col items-center justify-center">
      <Navbar />
      <section className="w-full min-h-screen flex flex-col items-center justify-center pt-24">
        <div className="w-full max-w-5xl bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col h-[90vh]">
          <div className="flex items-center justify-center py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold">Chat with ChronoBot</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "You" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "You" ? (
                  <div className="user-gradient-border rounded-2xl p-[2px] max-w-xs">
                    <div className="bg-white text-black dark:bg-gray-900 dark:text-white rounded-2xl px-4 py-2 shadow text-sm">
                      <div className="font-semibold mb-1">
                        {msg.sender}
                        <span className="ml-2 text-xs text-gray-400">
                          {msg.timestamp}
                        </span>
                      </div>
                      <div>
                        {msg.isLoading ? (
                          <span className="dot-typing">
                            <span className="dot" />
                            <span className="dot" />
                            <span className="dot" />
                          </span>
                        ) : (
                          msg.text
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl shadow text-sm bg-white dark:bg-gray-700 text-black dark:text-white`}
                  >
                    <div className="font-semibold mb-1">
                      {msg.sender}
                      <span className="ml-2 text-xs text-gray-400">
                        {msg.timestamp}
                      </span>
                    </div>
                    <div>
                      {msg.isLoading ? (
                        <span className="dot-typing">
                          <span className="dot" />
                          <span className="dot" />
                          <span className="dot" />
                        </span>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={handleSend}
            className="flex items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-2xl"
          >
            <input
              type="text"
              className="flex-1 p-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="ml-3 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-lime-400 text-white font-semibold border-2 border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-lime-400 transition-colors duration-200"
            >
              Send
            </button>
          </form>
        </div>
      </section>
      {/* Loading dots animation styles */}
      <style>{`
        .dot-typing {
          display: inline-block;
          width: 2em;
          text-align: left;
        }
        .dot-typing .dot {
          display: inline-block;
          width: 0.5em;
          height: 0.5em;
          margin-right: 0.1em;
          background: #a3e635;
          border-radius: 50%;
          animation: dot-typing 1s infinite linear alternate;
        }
        .dot-typing .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .dot-typing .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes dot-typing {
          0% { opacity: 0.2; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-0.2em); }
          100% { opacity: 0.2; transform: translateY(0); }
        }
        .user-gradient-border {
          background: linear-gradient(90deg, #a3e635, var(--color-primary));
        }
      `}</style>
    </main>
  );
};

export default Chat;
