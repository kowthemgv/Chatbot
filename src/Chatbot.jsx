// Chatbot.js
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import SendIcon from "@mui/icons-material/Send";
import { addMessage, clearMessages, loadMessages } from "./store";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Chatbot.css";
import MessageBubble from "./components/MessageBubble";
import ChatHeader from "./components/ChatHeader";
import WelcomeMessage from "./components/WelcomeMessage";

// Enhanced Predefined questions configuration with service types
const PREDEFINED_QUESTIONS = {
  serviceTypes: [
    {
      id: 'assistiq',
      title: 'AssistIQ',
      description: 'SAP business solutions and system queries',
    },
    {
      id: 'atlas',
      title: 'Atlas',
      description: 'Collaboration and project management tools',
    }
  ],
  mainCategories: {
    assistiq: [
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
    atlas: [
      {
        id: 'sharepoint',
        title: 'SharePoint',
        description: 'Document management and collaboration'
      },
      {
        id: 'jira',
        title: 'Jira',
        description: 'Project tracking and issue management'
      },
      {
        id: 'confluence',
        title: 'Confluence',
        description: 'Team collaboration and documentation'
      }
    ]
  },
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
    ],
    // Atlas subcategories can be added here if needed for further breakdown
    sharepoint: [],
    jira: [],
    confluence: []
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

const ChatActions = ({ activeChatTitle, onDeleteChat }) => (
  <div className="chat-actions flex justify-between items-center p-3 border-b">
    <div className="flex items-center">
      <h3 className="font-medium text-gray-800">
        {activeChatTitle || "New Conversation"}
      </h3>
    </div>
  </div>
);

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState(null);
  
  // Enhanced flow state for service selection
  const [currentFlow, setCurrentFlow] = useState({
    step: 'service', // service -> main -> sub -> prompt -> conversation
    selectedService: null,
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
      const savedChatHistory = loadFromStorage(STORAGE_KEYS.CHAT_HISTORY, []);
      const savedActiveChatId = loadFromStorage(STORAGE_KEYS.ACTIVE_CHAT_ID);
      const savedNextChatId = loadFromStorage(STORAGE_KEYS.NEXT_CHAT_ID, 1);
      
      setChatHistory(savedChatHistory);
      setNextChatId(savedNextChatId);
      
      const chatIdFromUrl = searchParams.get("chatId");
      const targetChatId = chatIdFromUrl || savedActiveChatId;
      
      if (targetChatId && savedChatHistory.find(chat => chat.id.toString() === targetChatId)) {
        setActiveChatId(targetChatId);
        
        const savedMessages = loadFromStorage(`${STORAGE_KEYS.MESSAGES}${targetChatId}`, []);
        const savedFlowState = loadFromStorage(`${STORAGE_KEYS.FLOW_STATE}${targetChatId}`, {
          step: 'conversation',
          selectedService: null,
          selectedMain: null,
          selectedSub: null
        });
        
        dispatch(loadMessages(savedMessages));
        setCurrentFlow(savedFlowState);
        
        if (!chatIdFromUrl) {
          setSearchParams({ chatId: targetChatId });
        }
      } else {
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

  // Show initial welcome and service selection for new chats
  useEffect(() => {
    if (isInitialized && activeChatId && messages.length === 0 && currentFlow.step === 'service') {
      setTimeout(() => {
        dispatch(
          addMessage({
            text: "Hello! Welcome to our intelligent assistant platform. Please select a service to get started:",
            user: false,
            timestamp: Date.now(),
            type: 'options',
            options: PREDEFINED_QUESTIONS.serviceTypes,
            isServiceSelection: true
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
    navigate('/login');
  };

  const handleSignOut = () => {
    setUser(null);
    removeFromStorage(STORAGE_KEYS.USER_DATA);
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

    // Service Type Selection
    if (currentFlow.step === 'service') {
      setCurrentFlow({
        step: 'main',
        selectedService: option.id,
        selectedMain: null,
        selectedSub: null
      });

      setTimeout(() => {
        const mainCategories = PREDEFINED_QUESTIONS.mainCategories[option.id];
        const serviceTitle = option.title;
        
        dispatch(
          addMessage({
            text: `Great! You selected ${serviceTitle}. Now please choose a specific category:`,
            user: false,
            timestamp: Date.now(),
            type: 'options',
            options: mainCategories,
            isMainCategory: true
          })
        );
      }, 800);
    }
    // Main Category Selection
    else if (currentFlow.step === 'main') {
      const subCategories = PREDEFINED_QUESTIONS.subCategories[option.id];
      
      // Check if subcategories exist for this main category
      if (subCategories && subCategories.length > 0) {
        setCurrentFlow({
          step: 'sub',
          selectedService: currentFlow.selectedService,
          selectedMain: option.id,
          selectedSub: null
        });

        setTimeout(() => {
          dispatch(
            addMessage({
              text: `Perfect! You selected ${option.title}. Now please choose a specific area:`,
              user: false,
              timestamp: Date.now(),
              type: 'options',
              options: subCategories,
              isSubCategory: true
            })
          );
        }, 800);
      } else {
        // No subcategories, go directly to conversation
        setCurrentFlow({
          step: 'conversation',
          selectedService: currentFlow.selectedService,
          selectedMain: option.id,
          selectedSub: null
        });

        setTimeout(() => {
          dispatch(
            addMessage({
              text: `Perfect! You've selected ${option.title}. Please describe your specific question or issue in detail, and I'll help you with it.`,
              user: false,
              timestamp: Date.now(),
            })
          );
        }, 800);
      }
    }
    // Sub Category Selection
    else if (currentFlow.step === 'sub') {
      setCurrentFlow({
        step: 'conversation',
        selectedService: currentFlow.selectedService,
        selectedMain: currentFlow.selectedMain,
        selectedSub: option.id
      });

      setTimeout(() => {
        dispatch(
          addMessage({
            text: `Excellent! You've selected ${option.title}. Please describe your specific question or issue in detail, and I'll help you with it.`,
            user: false,
            timestamp: Date.now(),
          })
        );
      }, 800);
    }

    // Update chat history
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
    if (activeChatId) {
      saveToStorage(`${STORAGE_KEYS.MESSAGES}${activeChatId}`, messages);
      saveToStorage(`${STORAGE_KEYS.FLOW_STATE}${activeChatId}`, currentFlow);
    }

    setActiveChatId(chatId);
    setSearchParams({ chatId });
    setIsSidebarOpen(false);

    const savedMessages = loadFromStorage(`${STORAGE_KEYS.MESSAGES}${chatId}`, []);
    const savedFlowState = loadFromStorage(`${STORAGE_KEYS.FLOW_STATE}${chatId}`, {
      step: 'conversation',
      selectedService: null,
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
      step: 'service',
      selectedService: null,
      selectedMain: null,
      selectedSub: null
    });
  };

  const handleDeleteChat = (chatId) => {
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
      
      // Enhanced flow context with service information
      const flowContext = currentFlow.selectedService ? {
        service: currentFlow.selectedService,
        serviceTitle: PREDEFINED_QUESTIONS.serviceTypes.find(s => s.id === currentFlow.selectedService)?.title,
        mainCategory: currentFlow.selectedMain,
        mainCategoryTitle: currentFlow.selectedMain ? 
          PREDEFINED_QUESTIONS.mainCategories[currentFlow.selectedService]?.find(c => c.id === currentFlow.selectedMain)?.title : null,
        subCategory: currentFlow.selectedSub,
        subCategoryTitle: currentFlow.selectedSub ? 
          PREDEFINED_QUESTIONS.subCategories[currentFlow.selectedMain]?.find(s => s.id === currentFlow.selectedSub)?.title : null
      } : null;

      const messageData = {
        text: input,
        user: true,
        timestamp: timestamp,
        flowContext: flowContext
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
        
        // Enhanced API payload with service context
        const apiPayload = {
          message: input,
          context: flowContext ? {
            service: flowContext.serviceTitle,
            category: flowContext.mainCategoryTitle,
            subCategory: flowContext.subCategoryTitle,
          } : null,
          conversationFlow: currentFlow,
          user: user,
          serviceType: currentFlow.selectedService 
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
  const shouldShowWelcome = messages.length === 0 && currentFlow.step === 'service';

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
                selectedService={currentFlow.selectedService}
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