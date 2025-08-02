import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import Users from '../authentication.json';
import { Alert } from "@mui/material";
import { loginWithApi } from "./api/authApi"; 

const STORAGE_KEYS = {
  USER_DATA: 'assistiq_user_data',
  AUTH_TOKEN: 'assistiq_auth_token'
};

const saveUserData = (userData) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    if (userData.token) {
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, userData.token);
    }
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

const setAuthenticatedUser = (userInfo) => {
  const userData = {
    id: userInfo.id || userInfo.username,
    name: userInfo.name || userInfo.username,
    email: userInfo.email || '',
    username: userInfo.username,
    token: userInfo.token || `token_${Date.now()}`,
    loginTime: new Date().toISOString(),
    authType: userInfo.authType || "mock"
  };
  saveUserData(userData);
  return userData;
};

const Auth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const authenticatedUser = Users.find(
      user => user.username === username && user.password === password
    );

    if (!authenticatedUser) {
      setAlert({ type: "error", message: "Invalid Credentials" });
      setIsLoading(false);
      return;
    }

    if (authenticatedUser.authType === "mock") {
      const userData = setAuthenticatedUser({
        id: authenticatedUser.username,
        username: authenticatedUser.username,
        name: authenticatedUser.username,
        email: `${authenticatedUser.username.toLowerCase()}@company.com`,
        role: "user",
        token: `token_${username}_${Date.now()}`,
        authType: "mock"
      });

      setAlert({ type: "success", message: "Login Successful!" });
      setTimeout(() => {
        navigate("/chatbot");
      }, 1000);
      setIsLoading(false);
      return;
    }

    // API authentication
    try {
      const response = await loginWithApi(username, password);

      if (response.status === "Success") {
        const userData = setAuthenticatedUser({
            id: authenticatedUser.username,
            username: authenticatedUser.username,
            name: authenticatedUser.username,
            email: `${authenticatedUser.username.toLowerCase()}@company.com`,
            role: "user",
            token: response.data,
            authType: "api"
        });

        setAlert({ type: "success", message: "Login Successful!" });
        setTimeout(() => {
          navigate("/chatbot");
        }, 1000);
      } else {
        setAlert({ type: "error", message: response.message || "Login failed" });
      }
    } catch (error) {
      console.error(error);
      setAlert({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (alert.message) setAlert({ type: "", message: "" });
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (alert.message) setAlert({ type: "", message: "" });
  };

  return (
    <div className="auth-container">
      <div className="form-container">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to continue to Spark</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
            <label htmlFor="username">Username</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <label htmlFor="password">Password</label>
          </div>

          <div className="forgot-password">
            <a href="/reset-password">Forgot Password?</a>
          </div>

          {alert.message && (
            <div className="alert-container">
              <Alert severity={alert.type}>{alert.message}</Alert>
            </div>
          )}

          <button
            type="submit"
            className={`login-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading || !username.trim() || !password.trim()}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
