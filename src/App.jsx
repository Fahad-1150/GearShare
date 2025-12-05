import React from "react";
import "./App.css";

export default function App() {
  return (
    <div className="login-page">

     
      <div className="logo-wrap">
       
        <img src="/images/logo.png" alt="Logo" className="logo" />
      </div>

     
      <div className="login-card">
        <h2>Login</h2>

        <input type="text" placeholder="Username" className="input" />
        <input type="password" placeholder="Password" className="input" />

        

        <button className="login-btn">Login</button>

        <p className="register-text">
          Don’t have an account? <a href="#" className="link">Register</a>
        </p>
      </div>
    </div>
  );
}
