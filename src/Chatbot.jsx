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
import LogoutIcon from "@mui/icons-material/Logout";
import { addMessage, clearMessages, loadMessages } from "./store";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Chatbot.css";
import DropdownComponent from "./DropDown";

// Predefined questions configuration
const PREDEFINED_QUESTIONS = {
  mainCategories: [
    {
      id: 'sap_systems',
      title: 'SAP System',
      description: 'Get help with SAP system queries'
    },
    {
      id: 'non_sap_systems',
      title: 'Non SAP System',
      description: 'Get help with Non-SAP system queries'
    }
  ],
  subCategories: {
    sap_systems: [
      {
        id: 'mozart',
        title: 'Mozart',
        description: 'Queries related to Mozart'
      },
      {
        id: 'metro',
        title: 'Metro',
        description: 'Queries related to Metro'
      }
    ],
    non_sap_systems: [
      {
        id: 'test',
        title: 'test',
        description: 'Queries related to test'
      },
    ]
  }
};

// Local Storage Helper Functions
const STORAGE_KEYS = {
  CHAT_HISTORY: 'assistiq_chat_history',
  ACTIVE_CHAT_ID: 'assistiq_active_chat_id',
  MESSAGES: 'assistiq_messages_',
  FLOW_STATE: 'assistiq_flow_state_',
  USER_DATA: 'assistiq_user_data',
  NEXT_CHAT_ID: 'assistiq_next_chat_id'
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

const ChatHeader = ({ onNewChat, user, onSignIn, onSignOut }) => (
  <div className="chat-header flex justify-between items-center p-4 bg-white border-b shadow-sm">
    <div className="flex items-center gap-4">
      <img src="image.png" alt="Logo" className="h-10 w-10" />
      <h2 className="text-xl font-semibold text-gray-800">AssistIQ</h2>
    </div>
    <div className="flex items-center gap-3">
      <button 
        onClick={onNewChat}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
      >
        <AddIcon fontSize="small" />
        New Chat
      </button>
      
      {user ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <AccountCircleIcon fontSize="large" className="text-gray-600" />
            <span className="text-gray-800 font-medium">{user.name}</span>
          </div>
          <button 
            onClick={onSignOut}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <LogoutIcon fontSize="small" />
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <AccountCircleIcon fontSize="large" className="text-gray-600" />
          <button 
            onClick={onSignIn}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Sign In
          </button>
        </div>
      )}
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
    <DropdownComponent/>
  </div>
);

const ClickableOption = ({ option, onClick, isSubCategory = false, isDisabled = false }) => (
  <div 
    className={`clickable-option ${isSubCategory ? 'sub-option-bubble' : 'main-option-bubble'} ${isDisabled ? 'disabled' : ''}`}
    onClick={isDisabled ? undefined : () => onClick(option)}
  >
    <div className="option-bubble-title">{option.title}</div>
    <div className="option-bubble-description">{option.description}</div>
    {isDisabled && <div className="selected-indicator">✓ Selected</div>}
  </div>
);

const MessageBubble = ({ message, isTyping = false, onOptionClick, currentFlowStep, selectedMainCategory, selectedSubCategory }) => {
  if (message.type === 'options') {
    return (
      <div className="flex justify-start mb-4">
        <div className="bot-message options-message">
          <div className="options-message-text">{message.text}</div>
          <div className="options-container">
            {message.options.map((option) => {
              // Determine if this option should be disabled
              let isDisabled = false;
              
              if (!message.isSubCategory) {
                // Main category options - disable if we've moved past main step and this was selected
                isDisabled = currentFlowStep !== 'main' && selectedMainCategory === option.id;
              } else {
                // Sub category options - disable if we've moved past sub step and this was selected
                isDisabled = currentFlowStep === 'conversation' && selectedSubCategory === option.id;
              }
              
              return (
                <ClickableOption
                  key={option.id}
                  option={option}
                  onClick={onOptionClick}
                  isSubCategory={message.isSubCategory}
                  isDisabled={isDisabled}
                />
              );
            })}
          </div>
          <div className="message-time">
            {message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </div>
        </div>
      </div>
    );
  }

  return (
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
};

const WelcomeMessage = () => (
  <div className="welcome-message-container">
    <div className="welcome-message-bubble">
      <div className="welcome-title">Welcome to AssistIQ! 👋</div>
      <div className="welcome-subtitle">
        Your advanced assistant for SAP business solutions. I'm here to help you with your queries.
      </div>
    </div>
  </div>
);

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState(null);
  
  // Flow state for predefined questions
  const [currentFlow, setCurrentFlow] = useState({
    step: 'main',
    selectedMain: null,
    selectedSub: null
  });

  const [chatHistory, setChatHistory] = useState([]);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeChatId, setActiveChatId] = useState(null);
  const [nextChatId, setNextChatId] = useState(1);
  
  const messages = useSelector((state) => state.chat.messages);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);

  // Load user data on component mount
  useEffect(() => {
    const savedUser = loadFromStorage(STORAGE_KEYS.USER_DATA);
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  // Initialize on component mount
  useEffect(() => {
    const initializeApp = () => {
      // Load saved data
      const savedChatHistory = loadFromStorage(STORAGE_KEYS.CHAT_HISTORY, []);
      const savedActiveChatId = loadFromStorage(STORAGE_KEYS.ACTIVE_CHAT_ID);
      const savedNextChatId = loadFromStorage(STORAGE_KEYS.NEXT_CHAT_ID, 1);
      
      setChatHistory(savedChatHistory);
      setNextChatId(savedNextChatId);
      
      const chatIdFromUrl = searchParams.get("chatId");
      const targetChatId = chatIdFromUrl || savedActiveChatId;
      
      if (targetChatId && savedChatHistory.find(chat => chat.id.toString() === targetChatId)) {
        // Load existing chat
        setActiveChatId(targetChatId);
        
        // Load messages for this chat
        const savedMessages = loadFromStorage(`${STORAGE_KEYS.MESSAGES}${targetChatId}`, []);
        const savedFlowState = loadFromStorage(`${STORAGE_KEYS.FLOW_STATE}${targetChatId}`, {
          step: 'conversation',
          selectedMain: null,
          selectedSub: null
        });
        
        dispatch(loadMessages(savedMessages));
        setCurrentFlow(savedFlowState);
        
        if (!chatIdFromUrl) {
          setSearchParams({ chatId: targetChatId });
        }
      } else {
        // Create new chat if no valid existing chat
        handleNewChat();
      }
      
      setIsInitialized(true);
    };

    if (!isInitialized) {
      initializeApp();
    }
  }, [searchParams, isInitialized, dispatch]);

  // Save messages whenever they change
  useEffect(() => {
    if (activeChatId && messages.length > 0) {
      saveToStorage(`${STORAGE_KEYS.MESSAGES}${activeChatId}`, messages);
    }
  }, [messages, activeChatId]);

  // Save flow state whenever it changes
  useEffect(() => {
    if (activeChatId) {
      saveToStorage(`${STORAGE_KEYS.FLOW_STATE}${activeChatId}`, currentFlow);
    }
  }, [currentFlow, activeChatId]);

  // Save chat history whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      saveToStorage(STORAGE_KEYS.CHAT_HISTORY, chatHistory);
    }
  }, [chatHistory]);

  // Save active chat ID whenever it changes
  useEffect(() => {
    if (activeChatId) {
      saveToStorage(STORAGE_KEYS.ACTIVE_CHAT_ID, activeChatId);
    }
  }, [activeChatId]);

  // Save next chat ID whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NEXT_CHAT_ID, nextChatId);
  }, [nextChatId]);

  // Show initial welcome and options for new chats
  useEffect(() => {
    if (isInitialized && activeChatId && messages.length === 0 && currentFlow.step === 'main') {
      setTimeout(() => {
        dispatch(
          addMessage({
            text: "Hello! I'm AssistIQ, your advanced assistant for SAP business solutions. Please select a category to get started:",
            user: false,
            timestamp: Date.now(),
            type: 'options',
            options: PREDEFINED_QUESTIONS.mainCategories,
            isSubCategory: false
          })
        );
      }, 1500);
    }
  }, [isInitialized, activeChatId, messages.length, currentFlow.step, dispatch]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatWindowRef.current && messages.length > 0) {
      setTimeout(() => {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
      }, 100);
    }
  }, [messages.length]);

  const handleSignIn = () => {
    // Navigate to sign in page - you can replace this with your login route
    navigate('/login');
  };

  const handleSignOut = () => {
    // Clear user data
    setUser(null);
    removeFromStorage(STORAGE_KEYS.USER_DATA);
    
    // Optionally clear all chat data on logout
    // Object.values(STORAGE_KEYS).forEach(key => removeFromStorage(key));
    
    // Navigate to login or home page
    navigate('/login');
  };

  const handleOptionClick = (option) => {
    const timestamp = Date.now();
    
    dispatch(
      addMessage({
        text: option.title,
        user: true,
        timestamp: timestamp,
      })
    );

    if (currentFlow.step === 'main') {
      setCurrentFlow({
        step: 'sub',
        selectedMain: option.id,
        selectedSub: null
      });

      setTimeout(() => {
        const subCategories = PREDEFINED_QUESTIONS.subCategories[option.id];
        dispatch(
          addMessage({
            text: `Great! You selected ${option.title}. Now please choose a specific area:`,
            user: false,
            timestamp: Date.now(),
            type: 'options',
            options: subCategories,
            isSubCategory: true
          })
        );
      }, 800);

    } else if (currentFlow.step === 'sub') {
      setCurrentFlow({
        step: 'prompt',
        selectedMain: currentFlow.selectedMain,
        selectedSub: option.id
      });

      setTimeout(() => {
        dispatch(
          addMessage({
            text: `Perfect! You've selected ${option.title}. Please describe your specific question or issue in detail, and I'll help you with it.`,
            user: false,
            timestamp: Date.now(),
          })
        );
        setCurrentFlow(prev => ({ ...prev, step: 'conversation' }));
      }, 800);
    }

    if (activeChatId) {
      setChatHistory((prevHistory) =>
        prevHistory.map((chat) =>
          chat.id.toString() === activeChatId
            ? { ...chat, lastMessage: option.title, timestamp: timestamp }
            : chat
        )
      );
    }
  };

  const handleSelectChat = (chatId) => {
    // Save current chat data before switching
    if (activeChatId) {
      saveToStorage(`${STORAGE_KEYS.MESSAGES}${activeChatId}`, messages);
      saveToStorage(`${STORAGE_KEYS.FLOW_STATE}${activeChatId}`, currentFlow);
    }

    setActiveChatId(chatId);
    setSearchParams({ chatId });
    setIsSidebarOpen(false);

    // Load messages and flow state for the selected chat
    const savedMessages = loadFromStorage(`${STORAGE_KEYS.MESSAGES}${chatId}`, []);
    const savedFlowState = loadFromStorage(`${STORAGE_KEYS.FLOW_STATE}${chatId}`, {
      step: 'conversation',
      selectedMain: null,
      selectedSub: null
    });

    dispatch(loadMessages(savedMessages));
    setCurrentFlow(savedFlowState);
  };

  const handleNewChat = () => {
    const newChatId = nextChatId.toString();
    const newChat = {
      id: nextChatId,
      title: `New Conversation ${nextChatId}`,
      lastMessage: "Start a new conversation",
      timestamp: Date.now(),
    };
    
    dispatch(clearMessages());
    
    setChatHistory(prevHistory => [newChat, ...prevHistory]);
    setNextChatId(nextChatId + 1);
    setActiveChatId(newChatId);
    setSearchParams({ chatId: newChatId });
    setIsSidebarOpen(false);
    
    setCurrentFlow({
      step: 'main',
      selectedMain: null,
      selectedSub: null
    });
  };

  const handleDeleteChat = (chatId) => {
    // Remove chat data from storage
    removeFromStorage(`${STORAGE_KEYS.MESSAGES}${chatId}`);
    removeFromStorage(`${STORAGE_KEYS.FLOW_STATE}${chatId}`);
    
    const updatedChatHistory = chatHistory.filter(
      (chat) => chat.id.toString() !== chatId.toString()
    );
    setChatHistory(updatedChatHistory);
    
    if (activeChatId === chatId.toString()) {
      if (updatedChatHistory.length > 0) {
        const newActiveChat = updatedChatHistory[0].id.toString();
        handleSelectChat(newActiveChat);
      } else {
        handleNewChat();
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSend = async () => {
    if (input.trim() !== "") {
      const timestamp = Date.now();
      
      const messageData = {
        text: input,
        user: true,
        timestamp: timestamp,
        flowContext: (currentFlow.selectedMain && currentFlow.selectedSub) ? {
          mainCategory: currentFlow.selectedMain,
          subCategory: currentFlow.selectedSub,
          mainCategoryTitle: PREDEFINED_QUESTIONS.mainCategories.find(c => c.id === currentFlow.selectedMain)?.title,
          subCategoryTitle: PREDEFINED_QUESTIONS.subCategories[currentFlow.selectedMain]?.find(s => s.id === currentFlow.selectedSub)?.title
        } : null
      };

      dispatch(addMessage(messageData));

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

      if (inputRef.current) {
        inputRef.current.focus();
      }

      try {
        setIsTyping(true);
        
        const apiPayload = {
          message: input,
          context: messageData.flowContext ? {
            category: messageData.flowContext.mainCategoryTitle,
            subCategory: messageData.flowContext.subCategoryTitle,
          } : null,
          conversationFlow: currentFlow,
          user: user // Include user context if logged in
        };

        const { data } = await axios.post(
          "https://run.mocky.io/v3/610f9d23-c4d1-4746-a28f-06401aeb89e0",
          apiPayload
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
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const activeChatTitle = activeChatId
    ? chatHistory.find((c) => c.id.toString() === activeChatId)?.title
    : "New Conversation";

  const shouldShowInput = currentFlow.step === 'conversation' || messages.length > 1;
  const shouldShowWelcome = messages.length === 0 && currentFlow.step === 'main';

  if (!isInitialized) {
    return (
      <div className="chat-container flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <ChatHeader 
        onNewChat={handleNewChat} 
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col h-full relative">
          <ChatActions
            activeChatTitle={activeChatTitle}
            onDeleteChat={() => handleDeleteChat(activeChatId)}
          />
          
          <div className="chat-messages-container" ref={chatWindowRef}>
            {shouldShowWelcome && <WelcomeMessage />}
            {messages.map((msg, index) => (
              <MessageBubble 
                key={index} 
                message={msg} 
                onOptionClick={handleOptionClick}
                currentFlowStep={currentFlow.step}
                selectedMainCategory={currentFlow.selectedMain}
                selectedSubCategory={currentFlow.selectedSub}
              />
            ))}
            {isTyping && (
              <MessageBubble message={{ user: false }} isTyping={true} />
            )}
          </div>
          
          {shouldShowInput && (
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;