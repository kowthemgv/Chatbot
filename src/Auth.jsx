import React, { useState } from "react";  
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";
import Users from '../authentication.json';
import { Alert } from "@mui/material";

// Import the auth utility functions
const STORAGE_KEYS = {
  USER_DATA: 'assistiq_user_data',
  AUTH_TOKEN: 'assistiq_auth_token'
};

const saveUserData = (userData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, userData.token);
    }
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

const setAuthenticatedUser = (userInfo) => {
  // Create user data object that matches what the chatbot expects
  const userData = {
    id: userInfo.id || userInfo.username,
    name: userInfo.name || userInfo.username,
    email: userInfo.email || '',
    username: userInfo.username,
    token: userInfo.token || `token_${Date.now()}`, // Generate a token if not provided
    loginTime: new Date().toISOString()
  };
  
  saveUserData(userData);
  return userData;
};

const Auth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({type: '', message: ''});
  const navigate = useNavigate();

  // Your original API-based login (commented out but available)
  const handleApiLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.post("https://your-backend.com/auth", {
        username,
        password,
      });

      if (data.approved) {
        // Use the integrated auth system
        const userData = setAuthenticatedUser({
          username: username,
          name: data.name || username,
          email: data.email || '',
          token: data.token,
          id: data.id || username
        });
        
        setAlert({type: 'success', message: 'Login Successful!'});
        
        // Small delay to show success message
        setTimeout(() => {
          navigate("/chatbot");
        }, 1000);
      } else {
        setAlert({type: 'error', message: 'Access Denied!'});
      }
    } catch (error) {
      console.error("Login Error:", error);
      setAlert({type: 'error', message: 'Error authenticating! Try again.'});
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // Find the authenticated user from your JSON file
      const authenticatedUser = Users.find(
        user => user.username === username && user.password === password
      );
      
      if (authenticatedUser) {
        // Set up the user data for the chatbot (adapting to your JSON structure)
        const userData = setAuthenticatedUser({
          id: authenticatedUser.username, // Using username as ID since no ID field in your JSON
          username: authenticatedUser.username,
          name: authenticatedUser.username, // Using username as display name
          email: `${authenticatedUser.username.toLowerCase()}@company.com`, // Generate email
          role: 'user',
          token: `token_${username}_${Date.now()}`
        });
        
        setAlert({type: 'success', message: 'Login Successful!'});
        
        // Small delay to show success message before redirect
        setTimeout(() => {
          navigate('/chatbot');
        }, 1000);
      } else {
        setAlert({type: 'error', message: 'Invalid Credentials'});
      }

      setIsLoading(false);
    }, 1500);
  };

  // Clear any existing alerts when user starts typing
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (alert.message) {
      setAlert({type: '', message: ''});
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (alert.message) {
      setAlert({type: '', message: ''});
    }
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
            className={`login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !username.trim() || !password.trim()}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        {/* <div className="auth-footer">
          <p>Don't have an account? <a href="/register">Create Account</a></p>
        </div> */}
      </div>
    </div>
  );
};

export default Auth;