import React from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from "../firebase";
import { useNavigate } from 'react-router-dom';

import './EmailLogin.css';

const EmailLogin = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Logged in as:", user.email);
      localStorage.setItem('userEmail', user.email);

     navigate("/dashboard");


    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="email-login-wrapper">
      <div className="email-login-container">
        <h2 className="email-login-heading">Welcome to Vocal Mail</h2>
        <button className="email-login-button" onClick={handleLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default EmailLogin;
