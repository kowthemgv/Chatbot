// ChatSidebar.js
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import ForumIcon from "@mui/icons-material/Forum";

const ChatSidebar = ({ chatHistory, onSelectChat, activeChatId, isOpen }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredChats = chatHistory.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this week, show day name
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`chat-sidebar ${isOpen ? 'open' : ''} md:block ${isOpen ? 'block' : 'hidden'}`}>
      <div className="sidebar-header flex justify-between items-center">
        <h3 className="font-medium text-gray-800">Recent Chats</h3>
        <button 
          className="md:hidden bg-gray-200 rounded-full p-1 text-gray-600"
          onClick={() => onSelectChat(null)}
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>
      
      <div className="p-3">
        <button 
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors mb-3"
          onClick={() => onSelectChat(null)}
        >
          <AddIcon fontSize="small" />
          <span>New Chat</span>
        </button>
        
        <div className="relative mb-3">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fontSize="small" />
          <input
            type="text"
            placeholder="Search conversations"
            className="w-full bg-gray-100 rounded-md py-2 pl-10 pr-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-list-item ${activeChatId === chat.id.toString() ? 'active' : ''}`}
              onClick={() => onSelectChat(chat.id.toString())}
            >
              <div className="flex items-start">
                <ChatIcon className="text-gray-500 mr-3 mt-1" fontSize="small" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-medium text-gray-800 truncate">{chat.title}</h4>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                      {formatTimestamp(chat.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No chats found
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;