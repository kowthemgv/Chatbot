// MessageBubble.js
import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import AtlasResponseDisplay from './AtlasResponseDisplay';
import AssistIQResponseDisplay from './AssistIQResponseDisplay';

const MessageBubble = ({ 
  message, 
  onOptionClick, 
  isTyping = false, 
  currentFlowStep,
  selectedService,
  selectedMainCategory,
  selectedSubCategory,
  isAtlasFlow,
  onSuggestionClick
}) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const TypingIndicator = () => (
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );

  const renderServiceOptions = (options) => {
    return (
      <div className="service-options-container">
        {options.map((option) => {
          const isSelected = selectedService === option.id;
          const isDisabled = currentFlowStep !== 'service' && !isSelected;
          
          return (
            <div
              key={option.id}
              className={`service-option-bubble ${option.id} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => !isDisabled && onOptionClick(option)}
              style={{ 
                position: 'relative',
                opacity: isDisabled ? 0.6 : 1,
                pointerEvents: isDisabled ? 'none' : 'auto'
              }}
            >
              {isSelected && (
                <div className="selected-indicator">
                  <CheckIcon sx={{ fontSize: 12 }} />
                  Selected
                </div>
              )}
              <div className="service-option-header">
                {/* <div className="service-option-icon">{option.icon}</div> */}
                <h3 className="service-option-title">{option.title}</h3>
              </div>
              <p className="service-option-description">{option.description}</p>
            </div>
          );
        })}
      </div>
    );
  };

  if (isAtlasFlow && message.response != null) {
    return (
      <div className="message-bubble bot-message atlas-response">
        <AtlasResponseDisplay 
          responseData={message.response}
          onSuggestionClick={onSuggestionClick}
        />
      </div>
    );
  }else if(!isAtlasFlow && message.response != null){
    return (
      <div className="message-bubble bot-message assist-response">
        <AssistIQResponseDisplay 
          responseData={message.response}
        />
      </div>
    );
  }

  const renderRegularOptions = (options, isSubCategory = false, isMainCategory = false) => {
    return (
      <div className="options-container">
        {options.map((option) => {
          let isSelected = false;
          let isDisabled = false;
          
          // Determine selection and disabled state based on flow step
          if (isMainCategory) {
            isSelected = selectedMainCategory === option.id;
            isDisabled = currentFlowStep !== 'main' && !isSelected;
          } else if (isSubCategory) {
            isSelected = selectedSubCategory === option.id;
            isDisabled = currentFlowStep !== 'sub' && !isSelected;
          }
          
          // Apply specific styling based on service type and category
          let optionClass = 'clickable-option';
          
          if (selectedService === 'atlas' && isMainCategory) {
            optionClass += ' atlas-main-option';
          } else if (isMainCategory) {
            optionClass += ' main-option-bubble';
          } else if (isSubCategory) {
            optionClass += ' sub-option-bubble';
          }
          
          if (isDisabled) {
            optionClass += ' disabled';
          }
          
          return (
            <div
              key={option.id}
              className={optionClass}
              onClick={() => !isDisabled && onOptionClick(option)}
              style={{ 
                position: 'relative',
                opacity: isDisabled ? 0.6 : 1,
                pointerEvents: isDisabled ? 'none' : 'auto'
              }}
            >
              {isSelected && (
                <div className="selected-indicator">
                  <CheckIcon sx={{ fontSize: 12 }} />
                  Selected
                </div>
              )}
              <div className="option-bubble-title">{option.title}</div>
              <div className="option-bubble-description">{option.description}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFlowBreadcrumb = () => {
    if (currentFlowStep === 'service' || !selectedService) return null;
    
    const serviceTitle = selectedService === 'assistiq' ? 'AssistIQ' : 
                        selectedService === 'atlas' ? 'Atlas' : selectedService;
    
    let breadcrumbItems = [serviceTitle];
    
    if (selectedMainCategory && currentFlowStep !== 'main') {
      // Get main category title based on service
      const mainCategories = selectedService === 'assistiq' ? 
        [
          { id: 'sap_systems', title: 'SAP System' },
          { id: 'non_sap_systems', title: 'Non SAP System' }
        ] :
        [
          { id: 'sharepoint', title: 'SharePoint' },
          { id: 'jira', title: 'Jira' },
          { id: 'confluence', title: 'Confluence' }
        ];
      
      const mainCat = mainCategories.find(cat => cat.id === selectedMainCategory);
      if (mainCat) {
        breadcrumbItems.push(mainCat.title);
      }
    }
    
    if (selectedSubCategory && currentFlowStep === 'conversation') {
      // Add subcategory if exists
      const subCategories = {
        'mozart': 'Mozart',
        'metro': 'Metro',
        'test': 'Test'
      };
      
      if (subCategories[selectedSubCategory]) {
        breadcrumbItems.push(subCategories[selectedSubCategory]);
      }
    }
    
    return (
      <div className="service-breadcrumb">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <span className={index === breadcrumbItems.length - 1 ? 'breadcrumb-current' : 'breadcrumb-item'}>
              {item}
            </span>
            {index < breadcrumbItems.length - 1 && (
              <span className="breadcrumb-separator">→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (isTyping) {
    return (
      <div className="flex justify-start mb-6 mt-6">
        <div className="message-bubble bot-message">
          <TypingIndicator />
        </div>
      </div>
    );
  }

  if (message.user) {
    return (
      <div className="flex justify-end mb-6 mt-6">
        <div className="message-bubble user-message">
          {message.text}
          {message.timestamp && (
            <div className="message-time">{formatTime(message.timestamp)}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="flex flex-col max-w-[90%]">
        {/* {renderFlowBreadcrumb()} */}
        <div className={`message-bubble bot-message ${message.type === 'options' ? 'options-message' : ''}`}>
          <div className="options-message-text">{message.text}</div>
          
          {message.type === 'options' && message.options && (
            <>
              {message.isServiceSelection ? 
                renderServiceOptions(message.options) :
                renderRegularOptions(
                  message.options, 
                  message.isSubCategory, 
                  message.isMainCategory
                )
              }
            </>
          )}
          
          {message.timestamp && (
            <div className="message-time">{formatTime(message.timestamp)}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;