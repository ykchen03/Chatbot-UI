"use client";
import { useState, useRef, useEffect } from "react";
import ReAppBar from "./components/AppBar";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PestControlIcon from "@mui/icons-material/PestControl";
import CodeIcon from '@mui/icons-material/Code';
import ChatIcon from '@mui/icons-material/Chat';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import LinearProgress from '@mui/material/LinearProgress';
import { Typography } from "@mui/material";
import RMarkdown from "./components/RMarkdown";
import generateBotResponse from "./lib/ChatBot";
import { PromptTypes } from "./lib/prompts";
import ParkFinder from "./lib/ParkFinder";

const App = () => {
  type Message = {
    text: string;
    sender: "user" | "bot";
  };
  const [promptType, setPromptType] = useState<PromptTypes>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLInputElement>(null);
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "3rem"; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Adjust height
    }
  };

  useEffect(() => {
    scrollToBottom();
    //console.log("Messages updated:", messages);
  }, [messages]);

  const handleSend = async (): Promise<void> => {
    if (!inputValue.trim()) return;
    const userMessage = { text: inputValue, sender: "user" as const };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "3rem";
    setIsLoading(true);

    // Await the bot response
    if (promptType === 'debug') {
      setTimeout(() => {
        const botResponse = {
          //text: `\`\`\`cpp\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!";\n    return 0;\n}\n\`\`\`\n| Column 1 | Column 2 |\n|----------|----------|\n| Value 1  | Value 2  |`,
          text: inputValue,
          sender: "bot" as const,
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsLoading(false);
      }, 3000);
    } else {
      const chatHistory = messages
        .map((msg) => `${msg.sender === "user" ? "User" : "Bot"}: ${msg.text}`)
        .join("\n");
      const botText = promptType === 'parkFinder' ? await ParkFinder(inputValue) : await generateBotResponse(
        promptType,
        inputValue,
        `Chat History: ${chatHistory}`,
      );
      const botMessage = {
        text: botText,
        sender: "bot" as const,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }
  };
  return (
    <>
      <ReAppBar />
      <div
        className={`relative flex min-h-[calc(100vh-64px)] max-h-[calc(100vh-185px)] flex-1 flex-col mx-auto max-w-3xl ${
          messages.length === 0 && "justify-center"
        }`}
      >
        <div className="flex-none"></div>
        {messages.length > 0 ? (
          <div className="flex flex-col flex-auto overflow-y-auto p-5 gap-4 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 [scrollbar-gutter:stable_both-edges] scrollbar">
            {messages.length > 0 &&
              messages?.map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col max-w-full py-3 px-4 leading-1.4 break-normal message text-white ${
                    message.sender === "user"
                      ? "self-end user-message"
                      : "self-start bot-message"
                  }`}
                >
                  {message.sender === "user" ? (
                    <p>{message.text}</p>
                  ) : (
                    <RMarkdown>{message.text}</RMarkdown>
                  )}
                </div>
              ))}
            {isLoading && (
              <div className="flex flex-col max-w-70% py-3 px-4 rounded-s-3xl leading-1.4 message bot-message text-gray-400">
                <LinearProgress color={"inherit"}/>
                {/* <div className="flex gap-1 items-center justify-start typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div> */}
              </div>
            )}
            <div ref={messagesEndRef} />
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
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
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
                icon={<ChatIcon />}
                label="Chat"
                variant={promptType === 'chat' ? "filled" : "outlined"}
                onClick={() => setPromptType('chat')}
                className="h-9"
                sx={{
                  backgroundColor: promptType === 'chat' ? "#2A4A6D" : "transparent",
                  "& .MuiChip-label": { color: promptType === 'chat' ? "#48AAFF" : "white" },
                  "& .MuiChip-icon": { fill: promptType === 'chat' ? "#48AAFF" : "white" },
                  borderColor: "#424242",
                  "&:hover": {
                    backgroundColor: promptType === 'chat' ? "#2A4A6D" : "transparent",
                  },
                }}
              /><Chip
                icon={<CodeIcon />}
                label="Code"
                variant={promptType === 'code' ? "filled" : "outlined"}
                onClick={() => setPromptType('code')}
                className="h-9"
                sx={{
                  backgroundColor: promptType === 'code' ? "#2A4A6D" : "transparent",
                  "& .MuiChip-label": { color: promptType === 'code' ? "#48AAFF" : "white" },
                  "& .MuiChip-icon": { fill: promptType === 'code' ? "#48AAFF" : "white" },
                  borderColor: "#424242",
                  "&:hover": {
                    backgroundColor: promptType === 'code' ? "#2A4A6D" : "transparent",
                  },
                }}
              />
              <Chip
                icon={<LocalParkingIcon />}
                label="Parking Lot"
                variant={promptType === 'parkFinder' ? "filled" : "outlined"}
                onClick={() => setPromptType('parkFinder')}
                className="h-9"
                sx={{
                  backgroundColor: promptType === 'parkFinder' ? "#2A4A6D" : "transparent",
                  "& .MuiChip-label": { color: promptType === 'parkFinder' ? "#48AAFF" : "white" },
                  "& .MuiChip-icon": { fill: promptType === 'parkFinder' ? "#48AAFF" : "white" },
                  borderColor: "#424242",
                  "&:hover": {
                    backgroundColor: promptType === 'parkFinder' ? "#2A4A6D" : "transparent",
                  },
                }}
              />
              <Chip
                icon={<PestControlIcon />}
                label="Debug"
                variant={promptType === 'debug' ? "filled" : "outlined"}
                onClick={() => setPromptType('debug')}
                className="h-9"
                sx={{
                  backgroundColor: promptType === 'debug' ? "#2A4A6D" : "transparent",
                  "& .MuiChip-label": { color: promptType === 'debug' ? "#48AAFF" : "white" },
                  "& .MuiChip-icon": { fill: promptType === 'debug' ? "#48AAFF" : "white" },
                  borderColor: "#424242",
                  "&:hover": {
                    backgroundColor: promptType === 'debug' ? "#2A4A6D" : "transparent",
                  },
                }}
              />
            </div>
            <div>
              <IconButton
                onClick={handleSend}
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
    </>
  );
};

export default App;
