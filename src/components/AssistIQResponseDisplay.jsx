import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const AssistIQResponseDisplay = ({ responseData }) => {

  const hasAnswer = responseData && responseData.trim().length > 0;

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

          {/* Message content */}
          {hasAnswer && (
            <p className="text-gray-800 whitespace-pre-wrap mb-4">{message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AssistIQResponseDisplay;