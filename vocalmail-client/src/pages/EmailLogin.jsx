import React from 'react';
import { motion } from 'framer-motion';
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
      <motion.div
        className="email-login-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.01 }}
      >
        <motion.h2
          className="email-login-heading"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Welcome to Vocal Mail
        </motion.h2>

        <motion.button
          className="email-login-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
        >
          Sign in with Google
        </motion.button>
      </motion.div>
    </div>
  );
};

export default EmailLogin;
