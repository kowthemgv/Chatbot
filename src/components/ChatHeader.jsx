import AddIcon from "@mui/icons-material/Add";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";

export default function ChatHeader({ onNewChat, user, onSignIn, onSignOut }){
    return(
        <div className="chat-header flex justify-between items-center p-4 bg-white border-b shadow-sm">
            <div className="flex items-center gap-4">
                {/* <img src="image.png" alt="Logo" className="h-10 w-10" /> */}
                <h2 className="text-xl font-semibold text-gray-800">✨Spark AI</h2>
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
}