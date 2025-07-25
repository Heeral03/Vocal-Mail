import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import app from '../firebase';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [email, setEmail] = useState('');
  const [emailCount, setEmailCount] = useState(null);
  const [userName, setUserName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const navigate = useNavigate();
  const audioRef = useRef(null);

  // Fetch logged-in user's email
  useEffect(() => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email);
    }
  }, []);

  // Fetch email data & user's name
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/emails');
        const {
          priorityEmails = [],
          otherEmails = [],
          userName: fetchedName,
        } = response.data || {};

        const total = priorityEmails.length + otherEmails.length;
        setEmailCount(total);
        setUserName(fetchedName || '');
      } catch (err) {
        console.error('❌ Error fetching emails:', err);
        setEmailCount(0);
        setUserName('');
      }
    };

    fetchEmails();
  }, []);

  // Play welcome + guidance using Murf TTS
  useEffect(() => {
    if (email && emailCount !== null) {
      const speakWelcome = async () => {
        try {
          const nameToUse = userName || email.split('@')[0];

          const introLine = `Hey ${nameToUse}, I'm Murf — your AI voice assistant.`;
          const inboxLine =
            emailCount === 0
              ? "You have a clean inbox. High five for staying on top of things! ✨"
              : `You’ve got ${emailCount} emails waiting. Don't worry, we’ll go through them together.`;

          const guideLine =
            "To begin, just click the 'Go to Inbox' button below and I’ll guide you through each email. Let’s dive in together, Shall We?";

          const fullMessage = `${introLine} ${inboxLine} ${guideLine}`;

          const response = await axios.post('http://localhost:5000/speak', {
            text: fullMessage,
          });

          const audio = new Audio(response.data.audioUrl);
          audioRef.current = audio;
          audio.volume = isMuted ? 0 : 1;
          setIsPlaying(true);

          audio.onended = () => setIsPlaying(false);
          audio.play();
        } catch (err) {
          console.error('🗣️ TTS Error:', err);
        }
      };

      speakWelcome();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [email, emailCount, userName, isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      if (audioRef.current) {
        audioRef.current.volume = prev ? 1 : 0;
      }
      return !prev;
    });
  };

  // ---- Styles ----
const styles = {
  container: {
    background: 'linear-gradient(to right,rgb(46, 3, 3),rgb(34, 4, 4))',
    color: '#fff',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Segoe UI", sans-serif',
    padding: '2rem',
  },
  card: {
    background: 'rgb(71, 2, 2)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: '3rem 2rem',
    borderRadius: '24px',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
    position: 'relative',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  heading: {
    fontSize: '2.4rem',
    marginBottom: '1rem',
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  emailCount: {
    fontSize: '1.1rem',
    marginBottom: '1.5rem',
    color: emailCount === 0 ? '#79ff97' : '#ffd966',
    fontWeight: '500',
  },
  infoText: {
    color: '#dddddd',
    fontSize: '0.95rem',
    marginBottom: '2rem',
    lineHeight: '1.6',
  },
button: {
  padding: '14px 36px',
  backgroundColor: 'rgb(133, 62, 63)',      // cherry red
  color: 'rgb(255, 255, 255)',              // white text
  border: 'none',
  borderRadius: '14px',
  fontSize: '1rem',
  cursor: 'pointer',
  boxShadow: '0 6px 18px rgba(163, 137, 138, 0.4)', // soft cherryish shadow
  transition: 'all 0.25s ease-in-out',
}
,
  muteButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'transparent',
    color: 'white',
    border: 'none',
    fontSize: '1.6rem',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  voiceBars: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '1.5rem',
    height: '26px',
  },
  bar: {
    width: '6px',
    backgroundColor: '#ffcdd2',
    borderRadius: '4px',
    animation: 'pulse 1s infinite ease-in-out',
  },
  bar1: {
    height: '16px',
    animationDelay: '0s',
  },
  bar2: {
    height: '24px',
    animationDelay: '0.2s',
  },
  bar3: {
    height: '18px',
    animationDelay: '0.4s',
  },
};


  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={toggleMute} style={styles.muteButton}>
          {isMuted ? '🔇' : '🔊'}
        </button>

        <h1 style={styles.heading}>Welcome, {userName || email.split('@')[0]} </h1>

        {emailCount !== null && (
          <p style={styles.emailCount}>
            {emailCount === 0
              ? 'Your inbox is all clear! 🎉'
              : `You have ${emailCount} unread email${emailCount > 1 ? 's' : ''}.`}
          </p>
        )}

        <p style={styles.infoText}>
          Click below to enter your inbox and start managing your emails with Murf.
        </p>

        <button
          style={styles.button}
          onClick={() => navigate('/inbox')}
          onMouseOver={(e) =>
            Object.assign(e.target.style, { backgroundColor: 'rgb(134, 77, 77)', transform: 'scale(1.05)' })
          }
          onMouseOut={(e) =>
            Object.assign(e.target.style, styles.button)
          }
        >
          Go to Inbox
        </button>

        {isPlaying && (
          <div style={styles.voiceBars}>
            <div style={{ ...styles.bar, ...styles.bar1 }} />
            <div style={{ ...styles.bar, ...styles.bar2 }} />
            <div style={{ ...styles.bar, ...styles.bar3 }} />
          </div>
        )}
      </div>

      {/* Voice Animation Keyframes */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.8); }
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
