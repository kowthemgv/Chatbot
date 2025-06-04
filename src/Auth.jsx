import React, { useState } from "react";  
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";
import Users from '../authentication.json';
import { Alert } from "@mui/material";

const Auth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({type: '', message: ''});
  const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const { data } = await axios.post("https://your-backend.com/auth", {
//         username,
//         password,
//       });

//       if (data.approved) {
//         localStorage.setItem("token", data.token);
//         navigate("/chatbot");
//       } else {
//         alert("Access Denied!");
//       }
//     } catch (error) {
//       console.error("Login Error:", error);
//       alert("Error authenticating! Try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

  const handleLogin = () => {
    setIsLoading(true);

    setTimeout(() => {
        const isAuthenticated = Users.some(
        user => user.username === username && user.password === password
        );
        if(isAuthenticated){
            setAlert({type: 'success', message: 'Login Successful!'});
            navigate('/chatbot');
        } else {
            setAlert({type: 'error', message: 'Invalid Credentials'});
        }

        setIsLoading(false);
    }, 1500);
  }

  return (
    <div className="auth-container">
      <div className="form-container">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to continue to the AssistIQ</p>
        </div>
        
        <form>
          <div className="input-group">
            <input 
              type="text" 
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label htmlFor="username">Username</label>
          </div>
          
          <div className="input-group">
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
          </div>
          
          <div className="forgot-password">
            <a href="/reset-password">Forgot Password?</a>
          </div>
          {
            alert.message &&
            <Alert severity={alert.type}>{alert.message}</Alert>
          }
          <button 
            type="submit" 
            className={`login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
            onClick={handleLogin}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <a href="/register">Create Account</a></p>
        </div>
      </div>
    </div>
  );
};

export default Auth;