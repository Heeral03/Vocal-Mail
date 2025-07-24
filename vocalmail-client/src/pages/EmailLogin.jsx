import React from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from "../firebase";
import { useNavigate } from 'react-router-dom';

const EmailLogin = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      navigate('/inbox'); // ✅ correct path
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="email-login-container">
      <h2>Login to VocalMail</h2>
      <button onClick={handleLogin}>Sign in with Google</button>
    </div>
  );
};

export default EmailLogin;
