import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import CAdmin from "./components/c-admin";
import AiNotice from "./components/AiNotice"; // <-- added
import "./App.css";

// Added fallback so API_BASE_URL always has a value
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://app2.heilab.pitt.edu/api";

function ChatbotPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLogin, setShowLogin] = useState(true);

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/login`,
        { email: userEmail, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsLoggedIn(true);
        setShowLogin(false);
      } else {
        alert(response.data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  const handleSignup = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        email: userEmail,
        password,
      });

      if (response.data.success) {
        alert("Signup successful! Please log in.");
        setShowLogin(true);
      } else {
        alert(response.data.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed. Please try again.");
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }

    setMessages((prev) => [...prev, { sender: "user", text: question }]);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        question,
        userEmail: isLoggedIn ? userEmail : "anonymous",
      });

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: response.data.answer },
      ]);
      setQuestion("");
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error retrieving response. Please try again." },
      ]);
    }
  };

  return (
    <div className="chat-container">
      <h1>Human Anatomy Chatbot</h1>

      {!isLoggedIn ? (
        <div className="login-container">
          <h2>{showLogin ? "Login" : "Signup"}</h2>
          <input
            type="email"
            placeholder="Email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {showLogin ? (
            <>
              <button onClick={handleLogin}>Login</button>
              <p>
                Don't have an account?{" "}
                <span onClick={() => setShowLogin(false)}>Signup</span>
              </p>
            </>
          ) : (
            <>
              <button onClick={handleSignup}>Signup</button>
              <p>
                Already have an account?{" "}
                <span onClick={() => setShowLogin(true)}>Login</span>
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="chat-box">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.sender === "user" ? "user-message" : "bot-message"
                }`}
              >
                <p>{message.text}</p>
              </div>
            ))}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your question..."
            />
            <button onClick={handleAsk}>Ask</button>
          </div>

          {/* Moved AI Notice to appear after chat input */}
          <AiNotice />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatbotPage />} />
        <Route path="/admin" element={<CAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;
