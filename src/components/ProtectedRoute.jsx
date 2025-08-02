import { Navigate } from "react-router-dom";

const STORAGE_KEYS = {
  USER_DATA: 'assistiq_user_data',
  AUTH_TOKEN: 'assistiq_auth_token'
};

export default function ProtectedRoute({children}){
    const authToken = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const user = sessionStorage.getItem(STORAGE_KEYS.USER_DATA)
    console.log(authToken);

    // if not token found, redirect to /auth
    if(!authToken || !user){
        return <Navigate to="/login" replace />
    }

    return children;
}