export default function ClickableOption({ option, onClick, isSubCategory = false, isDisabled = false }){
    return(
        <div 
            className={`clickable-option ${isSubCategory ? 'sub-option-bubble' : 'main-option-bubble'} ${isDisabled ? 'disabled' : ''}`}
            onClick={isDisabled ? undefined : () => onClick(option)}
        >
            <div className="option-bubble-title">{option.title}</div>
            <div className="option-bubble-description">{option.description}</div>
            {isDisabled && <div className="selected-indicator">✓ Selected</div>}
        </div>
    );
}