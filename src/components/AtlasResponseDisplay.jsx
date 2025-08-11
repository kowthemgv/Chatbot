import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import SourceOutlinedIcon from '@mui/icons-material/SourceOutlined';

const AtlasResponseDisplay = ({ responseData, onSuggestionClick }) => {
  console.log(responseData);
  const { files, message, suggestions } = responseData;

  const handleFileClick = (fileName, link) => {
    if (link) {
      window.open(link, '_blank');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  const hasAnswer = message && message.trim().length > 0;
  const hasFiles = files && Object.keys(files).length > 0;
  const hasSuggestions = suggestions && suggestions.length > 0;

  // for empty response
  if (!hasAnswer && !hasFiles && !hasSuggestions) {
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
        No information available for this query.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(hasAnswer || hasFiles) && (
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-center gap-2 mb-2">
            <ChatBubbleOutlineIcon className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Answer</span>
          </div>

          {/* Message content */}
          {hasAnswer && (
            <p className="text-gray-800 whitespace-pre-wrap mb-4">{message}</p>
          )}

          {/* Files section (inline with message) */}
          {hasFiles && (
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <SourceOutlinedIcon className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-blue-900">Source</span>
              </div>
              {Object.entries(files).map(([fileName, link], index) => (
                <div key={index} className="flex items-center gap-2">
                  <FilePresentIcon className="w-4 h-4 text-gray-500" />
                  {link ? (
                    <button
                      onClick={() => handleFileClick(fileName, link)}
                      className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                    >
                      {fileName}
                    </button>
                  ) : (
                    <span className="text-gray-700 text-sm">{fileName}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {!hasAnswer && (hasFiles || hasSuggestions) && (
        <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
          <p className="text-yellow-800 text-sm">
            No direct answer found, but check the resources below:
          </p>
        </div>
      )}

      {/* Suggestions */}
      {hasSuggestions && (
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
          <div className="flex items-center gap-2 mb-3">
            <ChatBubbleOutlineIcon className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-purple-900">
              {hasAnswer ? 'Related Questions' : 'Try These Questions'}
            </span>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="block w-3/4 text-left p-2 bg-white rounded border hover:bg-purple-100 text-sm text-gray-800 transition-colors"
                title="Click to copy to input field"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AtlasResponseDisplay;