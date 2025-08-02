import { Provider } from 'react-redux';
import './App.css';
import { store } from "./store";
import Chatbot from './Chatbot';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Auth from "./Auth";
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/chatbot" element={
            <ProtectedRoute>
                <Chatbot />
            </ProtectedRoute>
            } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
