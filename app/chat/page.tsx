"use client";
import { useState, useRef, useEffect } from "react";
import ReAppBar from "../components/AppBar";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ChatIcon from "@mui/icons-material/Chat";
import LinearProgress from "@mui/material/LinearProgress";
import { Typography } from "@mui/material";
import RMarkdown from "../components/RMarkdown";
import { useAuth } from "../contexts/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export default function App() {
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation);
    } else {
      setMessages([]);
    }
  }, [currentConversation]);

  const loadConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "New Conversation" }),
      });

      if (response.ok) {
        const newConversation = await response.json();
        setConversations((prev) => [newConversation, ...prev]);
        setCurrentConversation(newConversation.id);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);
    setMessages((prev) => [
          ...prev,
          { id:"tmp",role: "user", content: messageText, created_at: new Date().toISOString() },
        ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          conversationId: currentConversation,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // If this was a new conversation, update the conversation list and set current
        if (!currentConversation) {
          setCurrentConversation(data.conversation.id);
          setConversations((prev) => [data.conversation, ...prev]);
        }

        // Add both messages to the list
        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== "tmp"),
          data.userMessage,
          data.assistantMessage,
        ]);
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Re-add the message to input on error
      setInputMessage(inputMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        if (currentConversation === conversationId) {
          setCurrentConversation(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">
            Please sign in to continue
          </h1>
          <a
            href="/auth/signin"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const newChat = () => {
    setMessages([]);
    setInputMessage("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "3rem"; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Adjust height
    }
  };

  return (
    <>
      <ReAppBar conversations={conversations} newChat={newChat} setCurrentConversation={setCurrentConversation} deleteConversation={deleteConversation}>
        <div
          className={`relative flex min-h-[calc(100vh-64px)] max-h-[calc(100vh-185px)] flex-1 flex-col mx-auto max-w-3xl ${
            messages.length === 0 && "justify-center"
          }`}
        >
          {currentConversation ? (
            <div className="flex flex-col flex-auto overflow-y-auto p-5 gap-4 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 [scrollbar-gutter:stable_both-edges] scrollbar">
              {messages.length > 0 &&
                messages?.map((message, index) => (
                  <div
                    key={index}
                    className={`flex flex-col max-w-full py-3 px-4 leading-1.4 break-normal message text-white ${
                      message.role === "user"
                        ? "self-end user-message"
                        : "self-start bot-message"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p>{message.content}</p>
                    ) : (
                      <RMarkdown>{message.content}</RMarkdown>
                    )}
                  </div>
                ))}
              {isLoading && (
                <div className="flex flex-col max-w-70% py-3 px-4 rounded-s-3xl leading-1.4 message bot-message text-gray-400">
                  <LinearProgress color={"inherit"} />
                  {/* <div className="flex gap-1 items-center justify-start typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div> */}
                </div>
              )}
              {/* <div ref={messagesEndRef} /> */}
            </div>
          ) : (
            <div
              className={`flex flex-col items-center justify-center text-white h-full mb-7 fade-transition${
                messages.length > 0 ? " fade-out" : ""
              }`}
            >
              <Typography variant="h4">Hi there! 👋</Typography>
            </div>
          )}
          <div className="grid rounded-[28px] border text-base input-area text-white">
            <textarea
              ref={textareaRef}
              disabled={isLoading}
              className="scrollbar resize-none overflow-y-auto h-[3rem] max-h-[6rem] w-full px-4 py-3 outline-none"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Stack
              className="m-2 items-center"
              direction="row"
              justifyContent="space-between"
              spacing={0}
            >
              <div className="flex gap-2">
                <Chip
                  className="h-9"
                  icon={<ChatIcon />}
                  label="Chat"
                  /*variant={promptType === "chat" ? "filled" : "outlined"}
                onClick={() => setPromptType("chat")}
                sx={{
                  backgroundColor:
                    promptType === "chat" ? "#2A4A6D" : "transparent",
                  "& .MuiChip-label": {
                    color: promptType === "chat" ? "#48AAFF" : "white",
                  },
                  "& .MuiChip-icon": {
                    fill: promptType === "chat" ? "#48AAFF" : "white",
                  },
                  borderColor: "#424242",
                  "&:hover": {
                    backgroundColor:
                      promptType === "chat" ? "#2A4A6D" : "transparent",
                  },
                }}*/
                />
              </div>
              <div>
                <IconButton
                  onClick={sendMessage}
                  disabled={isLoading}
                  className="flex-none bg-white! hover:bg-gray-200! h-9 w-9"
                >
                  <ArrowUpwardIcon fontSize="inherit" className="fill-black!" />
                </IconButton>
              </div>
            </Stack>
          </div>
          <div className="flex justify-center items-center mb-3 text-xs text-white">
            AI can make mistakes. Check important info.
          </div>
        </div>
      </ReAppBar>
    </>
  );
}
