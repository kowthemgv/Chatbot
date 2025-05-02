// Chatbot.js
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SendIcon from "@mui/icons-material/Send";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterListIcon from "@mui/icons-material/FilterList";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import { addMessage } from "./store";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatSidebar from "./ChatSidebar";
import "./Chatbot.css";

const ChatHeader = ({ toggleSidebar }) => (
  <div className="chat-header flex justify-between items-center p-4 bg-white border-b shadow-sm">
    <div className="flex items-center gap-4">
      <button 
        className="md:hidden text-gray-600 p-1"
        onClick={toggleSidebar}
      >
        <MenuIcon />
      </button>
      <img src="logo.png" alt="Logo" className="h-10 w-10" />
      <h2 className="text-xl font-semibold text-gray-800">SAP-G Chatbot</h2>
    </div>
    <div className="flex items-center gap-3">
      <AccountCircleIcon fontSize="large" className="text-gray-600" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
        Sign In
      </button>
    </div>
  </div>
);

const ChatActions = ({ activeChatTitle }) => (
  <div className="chat-actions flex justify-between items-center">
    <div className="flex items-center">
      <h3 className="font-medium text-gray-800">{activeChatTitle || "New Conversation"}</h3>
    </div>
  </div>
);

const WelcomeMessage = () => (
  <div className="welcome-container">
    <div className="welcome-title">Welcome to SAP-G Chatbot</div>
    <div className="welcome-subtitle">
      Your advanced assistant for SAP business solutions. Ask questions about your SAP systems, 
      get help with issues, or explore best practices.
    </div>
  </div>
);

const MessageBubble = ({ message, isTyping = false }) => (
  <div className={`flex ${message.user ? "justify-end" : "justify-start"} mb-4`}>
    <div
      className={`message-bubble ${
        message.user 
          ? "user-message" 
          : "bot-message"
      }`}
    >
      {isTyping ? (
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      ) : (
        <>
          {message.text}
          <div className="message-time">
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </div>
        </>
      )}
    </div>
  </div>
);

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory] = useState([
    { id: 1, title: "Customer Inquiry", lastMessage: "How can I track my order?", timestamp: Date.now() - 3600000 },
    { id: 2, title: "Order Update", lastMessage: "Your order has been processed", timestamp: Date.now() - 86400000 },
    { id: 3, title: "Support Ticket", lastMessage: "Issue with payment processing", timestamp: Date.now() - 172800000 },
  ]);

  const [searchParams] = useSearchParams();
  const [activeChatId, setActiveChatId] = useState(searchParams.get("chatId") || null);

  const messages = useSelector((state) => state.chat.messages);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const chatIdFromUrl = searchParams.get("chatId");
    if (chatIdFromUrl && chatIdFromUrl !== activeChatId) {
      setActiveChatId(chatIdFromUrl);
      setShowWelcome(false);
    }
  }, [searchParams, activeChatId]);

  useEffect(() => {
    if (chatWindowRef.current && messages.length > 0) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    setShowWelcome(false);
    navigate(`?chatId=${chatId}`);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSend = async () => {
    if (input.trim() !== "") {
      setShowWelcome(false);
      
      const timestamp = Date.now();
      dispatch(addMessage({ 
        text: input, 
        user: true,
        timestamp: timestamp
      }));
      
      setInput("");
      
      // Focus back on input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }

      try {
        setIsTyping(true);
        const { data } = await axios.post(
          "https://run.mocky.io/v3/610f9d23-c4d1-4746-a28f-06401aeb89e0",
          { message: input }
        );

        setTimeout(() => {
          dispatch(addMessage({ 
            text: data, 
            user: false,
            timestamp: Date.now()
          }));
          setIsTyping(false);
        }, 1000);
      } catch (error) {
        setIsTyping(false);
        dispatch(addMessage({ 
          text: "Error fetching response. Please try again.", 
          user: false,
          timestamp: Date.now()
        }));
      }
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Auto resize the textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const activeChatTitle = activeChatId 
    ? chatHistory.find(c => c.id.toString() === activeChatId)?.title 
    : "New Conversation";

  return (
    <div className="chat-container">
      <ChatHeader toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar 
          chatHistory={chatHistory} 
          onSelectChat={handleSelectChat} 
          activeChatId={activeChatId}
          isOpen={isSidebarOpen}
        />
        
        <div className="flex-1 flex flex-col h-full relative">
          <ChatActions activeChatTitle={activeChatTitle} />

          {/* Chat messages area */}
          <div 
            className="chat-messages-container" 
            ref={chatWindowRef}
          >
            {showWelcome ? (
              <WelcomeMessage />
            ) : (
              <>
                {messages.map((msg, index) => (
                  <MessageBubble key={index} message={msg} />
                ))}
                {isTyping && (
                  <MessageBubble 
                    message={{ user: false }} 
                    isTyping={true} 
                  />
                )}
              </>
            )}
          </div>

          {/* Message input area */}
          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="chat-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                className="send-button"
                onClick={handleSend}
                disabled={input.trim() === ""}
              >
                <SendIcon fontSize="small" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;