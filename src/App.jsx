import { Provider } from 'react-redux';
import './App.css';
import { store } from "./store";
import Chatbot from './Chatbot';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Auth from "./Auth";


const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
