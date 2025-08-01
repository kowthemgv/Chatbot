import ClickableOption from "./ClickableOption";

export default function MessageBubble({ message, isTyping = false, onOptionClick, currentFlowStep, selectedMainCategory, selectedSubCategory }){
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
}