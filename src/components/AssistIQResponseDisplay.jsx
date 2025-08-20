import React from 'react';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
 
const AssistIQResponseDisplay = ({ responseData }) => {
  console.log(responseData);
 
  // Clean and parse the response data
  const cleanText = (text) => {
    if (!text) return '';
   
    // Remove surrounding quotes if present
    let cleaned = text.replace(/^"|"$/g, '');
   
    // Replace escaped newlines with actual newlines
    cleaned = cleaned.replace(/\\n/g, '\n');
   
    // Replace escaped quotes with regular quotes
    cleaned = cleaned.replace(/\\"/g, '"');
   
    return cleaned;
  };
 
  const cleanedResult = cleanText(responseData?.result);
  const hasAnswer = cleanedResult && cleanedResult.trim().length > 0;
 
  // Function to parse and render formatted text safely
  const renderFormattedText = (text) => {
    // Split text by lines to handle line breaks
    const lines = text.split('\n');
   
    return lines.map((line, lineIndex) => {
      // Parse bold text (**text**)
      const parts = line.split(/(\*\*.*?\*\*)/g);
     
      return (
        <div key={lineIndex}>
          {parts.map((part, partIndex) => {
            // Check if this part is bold (wrapped in **)
            if (part.startsWith('**') && part.endsWith('**')) {
              const boldText = part.slice(2, -2); // Remove ** from both ends
              return <strong key={partIndex}>{boldText}</strong>;
            }
            return part;
          })}
        </div>
      );
    });
  };
 
  // for empty response
  if (!hasAnswer) {
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
        No information available for this query.
      </div>
    );
  }
 
  return (
    <div className="space-y-4">
      {hasAnswer && (
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-center gap-2 mb-2">
            <ChatBubbleOutlineIcon className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Answer</span>
          </div>
 
          {/* Message content with safe formatting */}
          <div className="text-gray-800 mb-4 space-y-1">
            {renderFormattedText(cleanedResult)}
          </div>
        </div>
      )}
    </div>
  );
};
 
<<<<<<< HEAD
export default AssistIQResponseDisplay;
 
=======
export default AssistIQResponseDisplay;
>>>>>>> a1546060cfa8271b87f3083aa1d8ccc6c8299d42
