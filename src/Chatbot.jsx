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
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import ForumIcon from "@mui/icons-material/Forum";
import { addMessage } from "./store";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Chatbot.css";

const ChatHeader = ({ toggleSidebar }) => (
  <div className="chat-header flex justify-between items-center p-4 bg-white border-b shadow-sm">
    <div className="flex items-center gap-4">
      <button className="md:hidden text-gray-600 p-1" onClick={toggleSidebar}>
        <MenuIcon />
      </button>
      <img src="image.png" alt="Logo" className="h-10 w-10" />
      <h2 className="text-xl font-semibold text-gray-800">AssistIQ</h2>
    </div>
    <div className="flex items-center gap-3">
      <AccountCircleIcon fontSize="large" className="text-gray-600" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
        Sign In
      </button>
    </div>
  </div>
);

const ChatActions = ({ activeChatTitle, onDeleteChat }) => (
  <div className="chat-actions flex justify-between items-center p-3 border-b">
    <div className="flex items-center">
      <h3 className="font-medium text-gray-800">
        {activeChatTitle || "New Conversation"}
      </h3>
    </div>
    {activeChatTitle && (
      <button
        onClick={onDeleteChat}
        className="text-gray-500 hover:text-red-500 transition-colors"
        title="Delete this conversation"
      >
        <DeleteOutlineIcon fontSize="small" />
      </button>
    )}
  </div>
);

const WelcomeMessage = () => (
  <div className="welcome-container">
    <div className="welcome-title">Welcome to AssistIQ</div>
    <div className="welcome-subtitle">
      Your advanced assistant for SAP business solutions. Ask questions about
      your SAP systems, get help with issues, or explore best practices.
    </div>
  </div>
);

const MessageBubble = ({ message, isTyping = false }) => (
  <div
    className={`flex ${message.user ? "justify-end" : "justify-start"} mb-4`}
  >
    <div
      className={`message-bubble ${
        message.user ? "user-message" : "bot-message"
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
            {message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </div>
        </>
      )}
    </div>
  </div>
);

// Enhanced ChatSidebar component with new chat and delete functionality
const EnhancedChatSidebar = ({
  chatHistory,
  onSelectChat,
  activeChatId,
  isOpen,
  onNewChat,
  onDeleteChat,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isHovering, setIsHovering] = useState(null);

  const filteredChats = chatHistory.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();

    //today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleDateString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    //this week means show day name
    const daydiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (daydiff < 7) {
      return date.toLocaleTimeString([], { weekday: "short" });
    }

    //or show date
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div
      className={`chat-sidebar ${isOpen ? "open" : ""} md:block ${
        isOpen ? "block" : "hidden"
      }`}
    >
      

      <div className="sidebar-header flex justify-between items-center p-4 border-b">
        <h3 className="font-medium text-grey-800 fkex items-center">
          <ForumIcon fontSize="small" className="mr-2 text-blue-500" />
          Chat History
        </h3>
        <button
          className="md:hidden bg-gray-200 rounded-full p-1 text-gray-600"
          onClick={() => onSelectChat(null)}
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>
      
      <div className="p-3">
        <button
          className="w-full flex items-center gap-2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors mb-3"
          onClick={onNewChat}
        >
          <AddIcon fontSize="small" />
          <span>New Chat</span>
        </button>

        <div className="relative mb-4">
          <SearchIcon
            className="absolute left-3 top-1/2 trasnform -translate-y-1/2 text-gray-400"
            fontSize="small"
          />
          <input
            type="text"
            placeholder="Search Conversation"
            className="w-full bg-gray-100 roubded-md py-2 pl-10 pr-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="chat-history overflow-y-auto max-h-[calc(100vh-220px)]">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-list-item ${
                activeChatId === chat.id.toString() ? "active" : ""
              }`}
              onClick={() => onSelectChat(chat.id.toString())}
              onMouseEnter={() => setIsHovering(chat.id)}
              onMouseLeave={() => setIsHovering(null)}
            >
              <div className="flex items-start p-3">
                <div className="chat-icon-container mr-3 mt-1">
                  <ChatIcon
                    className={`${
                      activeChatId === chat.id.toString()
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                    fontSize="small"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-medium text-gray-800 truncate">
                      {chat.title}
                    </h4>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                      {formatTimestamp(chat.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {chat.lastMessage}
                  </p>
                </div>
                {(isHovering === chat.id ||
                  activeChatId === chat.id.toString()) && (
                  <button
                    className="delete-btn ml-2 text-gray-400 hover: text-red-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state p-4 text-center">
            <div className="empty-icon mb-3 flex justify-center">
              <HistoryIcon fontSize="large" className="text-gray-300" />
            </div>
            <p className="text-gray-500">No Conversation found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      title: "Customer Inquiry",
      lastMessage: "How can I track my order?",
      timestamp: Date.now() - 3600000,
    },
    {
      id: 2,
      title: "Order Update",
      lastMessage: "Your order has been processed",
      timestamp: Date.now() - 86400000,
    },
    {
      id: 3,
      title: "Support Ticket",
      lastMessage: "Issue with payment processing",
      timestamp: Date.now() - 172800000,
    },
  ]);

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeChatId, setActiveChatId] = useState(
    searchParams.get("chatId") || null
  );
  const [nextChatId, setNextChatId] = useState(4); // For generating new chat IDs

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
    setSearchParams({ chatId });
    setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    const newChatId = nextChatId.toString();
    const newChat = {
      id: nextChatId,
      title: `New Conversation ${nextChatId}`,
      lastMessage: "Start a new conversation",
      timestamp: Date.now(),
    };

    setChatHistory([newChat, ...chatHistory]);
    setNextChatId(nextChatId + 1);
    setActiveChatId(newChatId);
    setShowWelcome(true);
    setSearchParams({ chatId: newChatId });

    // Clear messages when starting a new chat
    // This would need to be handled in your Redux store
    // For now, we'll just navigate to the new chat
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = (chatId) => {
    const updatedChatHistory = chatHistory.filter(
      (chat) => chat.id.toString() !== chatId.toString()
    );
    setChatHistory(updatedChatHistory);

    // If we're deleting the active chat, switch to a new one or clear
    if (activeChatId === chatId.toString()) {
      if (updatedChatHistory.length > 0) {
        const newActiveChat = updatedChatHistory[0].id.toString();
        setActiveChatId(newActiveChat);
        setSearchParams({ chatId: newActiveChat });
      } else {
        setActiveChatId(null);
        setSearchParams({});
        setShowWelcome(true);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSend = async () => {
    if (input.trim() !== "") {
      setShowWelcome(false);

      const timestamp = Date.now();
      dispatch(
        addMessage({
          text: input,
          user: true,
          timestamp: timestamp,
        })
      );

      // Update the last message in chat history
      if (activeChatId) {
        setChatHistory((prevHistory) =>
          prevHistory.map((chat) =>
            chat.id.toString() === activeChatId
              ? { ...chat, lastMessage: input, timestamp: timestamp }
              : chat
          )
        );
      }

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
          dispatch(
            addMessage({
              text: data,
              user: false,
              timestamp: Date.now(),
            })
          );
          setIsTyping(false);
        }, 1000);
      } catch (error) {
        setIsTyping(false);
        dispatch(
          addMessage({
            text: "Error fetching response. Please try again.",
            user: false,
            timestamp: Date.now(),
          })
        );
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
    ? chatHistory.find((c) => c.id.toString() === activeChatId)?.title
    : "New Conversation";

  return (
    <div className="chat-container">
      <ChatHeader toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <EnhancedChatSidebar
          chatHistory={chatHistory}
          onSelectChat={handleSelectChat}
          activeChatId={activeChatId}
          isOpen={isSidebarOpen}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />

        <div className="flex-1 flex flex-col h-full relative">
          <ChatActions
            activeChatTitle={activeChatTitle}
            onDeleteChat={() => handleDeleteChat(activeChatId)}
          />

          {/* Chat messages area */}
          <div className="chat-messages-container" ref={chatWindowRef}>
            {showWelcome ? (
              <WelcomeMessage />
            ) : (
              <>
                {messages.map((msg, index) => (
                  <MessageBubble key={index} message={msg} />
                ))}
                {isTyping && (
                  <MessageBubble message={{ user: false }} isTyping={true} />
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
