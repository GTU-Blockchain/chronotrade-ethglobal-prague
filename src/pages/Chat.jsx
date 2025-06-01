import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const AGENT_NAME = "ChronoBot";
const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

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

    // Function to call Gemini API
    const callGeminiAPI = async (message) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Gemini API key not found in environment variables");
            return "I apologize, but I'm not properly configured. Please check my API key setup.";
        }

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `You are ChronoBot, a helpful assistant for the ChronoTrade platform. 
                  ChronoTrade is a time-based service trading platform where users can trade their time using TIME tokens.
                  
                  Important: Always format your responses using markdown. Use:
                  - **bold** for emphasis
                  - \`code\` for technical terms
                  - \`\`\` for code blocks
                  - Lists with - or 1. 2. 3.
                  - > for quotes or important notes
                  
                  The user's message is: ${message}
                  Please provide a helpful response that is relevant to ChronoTrade and time trading.`,
                                },
                            ],
                        },
                    ],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error(
                    "Gemini API error:",
                    errorData || response.statusText
                );
                throw new Error("Failed to get response from Gemini");
            }

            const data = await response.json();
            if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error("Invalid response format from Gemini");
            }
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            return "I apologize, but I'm having trouble connecting to my brain right now. Please try again later.";
        }
    };

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

            // Get response from Gemini
            callGeminiAPI(initialMessage)
                .then((response) => {
                    replaceAgentLoading(response);
                })
                .catch((error) => {
                    console.error("Error getting initial response:", error);
                    replaceAgentLoading(
                        "I apologize, but I'm having trouble connecting right now. Please try again."
                    );
                });
        }
    }, [initialMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
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

        try {
            const response = await callGeminiAPI(input);
            replaceAgentLoading(response);
        } catch (error) {
            console.error("Error getting response:", error);
            replaceAgentLoading(
                "I apologize, but I'm having trouble connecting right now. Please try again."
            );
        }
    };

    return (
        <main className="min-h-screen bg-white dark:bg-[var(--color-background-dark)] text-black dark:text-white flex flex-col items-center justify-center">
            <Navbar />
            <section className="w-full min-h-screen flex flex-col items-center justify-center pt-24">
                <div className="w-full max-w-5xl bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col h-[90vh]">
                    <div className="flex items-center justify-center py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold">
                            Chat with ChronoBot
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${
                                    msg.sender === "You"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                {msg.sender === "You" ? (
                                    <div className="user-gradient-border rounded-2xl p-[2px] max-w-2xl">
                                        <div className="bg-white text-black dark:bg-gray-900 dark:text-white rounded-2xl px-4 py-2 shadow text-sm">
                                            <div className="font-semibold mb-1">
                                                {msg.sender}
                                                <span className="ml-2 text-xs text-gray-400">
                                                    {msg.timestamp}
                                                </span>
                                            </div>
                                            <div className="prose dark:prose-invert max-w-none">
                                                {msg.isLoading ? (
                                                    <span className="dot-typing">
                                                        <span className="dot" />
                                                        <span className="dot" />
                                                        <span className="dot" />
                                                    </span>
                                                ) : (
                                                    <ReactMarkdown
                                                        remarkPlugins={[
                                                            remarkGfm,
                                                        ]}
                                                        components={{
                                                            code({
                                                                node,
                                                                inline,
                                                                className,
                                                                children,
                                                                ...props
                                                            }) {
                                                                const match =
                                                                    /language-(\w+)/.exec(
                                                                        className ||
                                                                            ""
                                                                    );
                                                                return !inline &&
                                                                    match ? (
                                                                    <SyntaxHighlighter
                                                                        style={
                                                                            vscDarkPlus
                                                                        }
                                                                        language={
                                                                            match[1]
                                                                        }
                                                                        PreTag="div"
                                                                        {...props}
                                                                    >
                                                                        {String(
                                                                            children
                                                                        ).replace(
                                                                            /\n$/,
                                                                            ""
                                                                        )}
                                                                    </SyntaxHighlighter>
                                                                ) : (
                                                                    <code
                                                                        className={
                                                                            className
                                                                        }
                                                                        {...props}
                                                                    >
                                                                        {
                                                                            children
                                                                        }
                                                                    </code>
                                                                );
                                                            },
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`max-w-2xl px-4 py-2 rounded-2xl shadow text-sm bg-white dark:bg-gray-700 text-black dark:text-white`}
                                    >
                                        <div className="font-semibold mb-1">
                                            {msg.sender}
                                            <span className="ml-2 text-xs text-gray-400">
                                                {msg.timestamp}
                                            </span>
                                        </div>
                                        <div className="prose dark:prose-invert max-w-none">
                                            {msg.isLoading ? (
                                                <span className="dot-typing">
                                                    <span className="dot" />
                                                    <span className="dot" />
                                                    <span className="dot" />
                                                </span>
                                            ) : (
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code({
                                                            node,
                                                            inline,
                                                            className,
                                                            children,
                                                            ...props
                                                        }) {
                                                            const match =
                                                                /language-(\w+)/.exec(
                                                                    className ||
                                                                        ""
                                                                );
                                                            return !inline &&
                                                                match ? (
                                                                <SyntaxHighlighter
                                                                    style={
                                                                        vscDarkPlus
                                                                    }
                                                                    language={
                                                                        match[1]
                                                                    }
                                                                    PreTag="div"
                                                                    {...props}
                                                                >
                                                                    {String(
                                                                        children
                                                                    ).replace(
                                                                        /\n$/,
                                                                        ""
                                                                    )}
                                                                </SyntaxHighlighter>
                                                            ) : (
                                                                <code
                                                                    className={
                                                                        className
                                                                    }
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </code>
                                                            );
                                                        },
                                                    }}
                                                >
                                                    {msg.text}
                                                </ReactMarkdown>
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
        .prose pre {
          margin: 1em 0;
          padding: 1em;
          border-radius: 0.5em;
          background: #1e1e1e;
        }
        .prose code {
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          background: rgba(0, 0, 0, 0.1);
        }
        .prose p {
          margin: 0.5em 0;
        }
        .prose ul, .prose ol {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
        .prose blockquote {
          margin: 0.5em 0;
          padding-left: 1em;
          border-left: 4px solid var(--color-primary);
          color: #666;
        }
        .dark .prose blockquote {
          color: #999;
        }
      `}</style>
        </main>
    );
};

export default Chat;
