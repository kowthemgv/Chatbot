import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

export default function ChatHeader({ user, onSignIn, onSignOut }) {
    console.log("User:", user);
    console.log("User type:", typeof user);
    let parsedUser = typeof user === 'string' ? JSON.parse(user) : user;
    console.log("Parsed user name:", parsedUser.name);
    if (user) {
        console.log("User name:", user.name);
    }
    return (
        <div className="chat-header flex items-center p-4 bg-white border-b shadow-sm">
            <div className="basis-1/4 flex justify-start items-center">
                <img src="spark.png" alt="Spark AI Logo" className="h-20 w-auto" />
            </div>

            <div className="basis-2/4 flex justify-center items-center">
                <h2 className="typewriter text-xl font-semibold text-gray-700">
                    <span className="text-yellow-500 font-bold text-xl">S</span>ony GISC <span className="text-yellow-500 font-bold text-xl">P</span>latform For <span className="text-yellow-500 font-bold text-xl">A</span>I <span className="text-yellow-500 font-bold text-xl">R</span>ealization & <span className="text-yellow-500 font-bold text-xl">K</span>nowledge
                </h2>
            </div>

            <div className="basis-1/4 flex justify-end items-center gap-3">
                {user ? (
                <>
                    <div className="flex items-center gap-2">
                    <AccountCircleOutlinedIcon fontSize="large" className="text-gray-600" />
                    <span className="text-gray-800 font-medium">{parsedUser.name}</span>
                    </div>
                    <button
                    onClick={onSignOut}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
                    >
                    <LogoutIcon fontSize="small" />
                    Sign Out
                    </button>
                </>
                ) : (
                <>
                    <AccountCircleOutlinedIcon fontSize="large" className="text-gray-600" />
                    <button
                    onClick={onSignIn}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
                    >
                    Sign In
                    </button>
                </>
                )}
            </div>
        </div>
    );
}