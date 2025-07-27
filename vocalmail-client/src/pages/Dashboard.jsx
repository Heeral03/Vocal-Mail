import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import app from '../firebase';
import { useNavigate } from 'react-router-dom';
// ...imports remain the same

const Dashboard = () => {
  const [email, setEmail] = useState('');
  const [emailCount, setEmailCount] = useState(null);
  const [userName, setUserName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) setEmail(user.email);
  }, []);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/emails');
        const {
          priorityEmails = [],
          otherEmails = [],
          userName: fetchedName,
        } = response.data || {};
        setEmailCount(priorityEmails.length + otherEmails.length);
        setUserName(fetchedName || '');
      } catch (err) {
        console.error('❌ Error fetching emails:', err);
        setEmailCount(0);
        setUserName('');
      }
    };
    fetchEmails();
  }, []);

  useEffect(() => {
    if (email && emailCount !== null) {
      const speakWelcome = async () => {
        try {
          const nameToUse = userName || email.split('@')[0];
          const fullMessage = `Hey ${nameToUse}, I'm Murf — your AI voice assistant. ${
            emailCount === 0
              ? "You have a clean inbox. High five for staying on top of things! ✨"
              : `You’ve got ${emailCount} emails waiting.`
          } To begin, just click the 'Go to Inbox' button below. Let’s dive in together, Shall We?!!`;

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
      if (audioRef.current) audioRef.current.volume = prev ? 1 : 0;
      return !prev;
    });
  };

  const nameToShow = userName || (email ? email.split('@')[0] : '');

  return (
    <div style={styles.container}>
      {/* 🌊 Circular Waves */}
      <div style={styles.visualization}>
        <div className="voice-circle">
          <div className="voice-waves">
            <div className="wave wave-1"></div>
            <div className="wave wave-2"></div>
            <div className="wave wave-3"></div>
          </div>
        </div>
      </div>

      {/* 📦 Card */}
      <div style={styles.card}>
        <button onClick={toggleMute} style={styles.muteButton}>
          {isMuted ? '🔇' : '🔊'}
        </button>

        <h1 style={styles.heading}>Welcome, {nameToShow}</h1>

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
            Object.assign(e.target.style, {
              backgroundColor: 'rgb(134, 77, 77)',
              transform: 'scale(1.05)',
            })
          }
          onMouseOut={(e) => Object.assign(e.target.style, styles.button)}
        >
          Go to Inbox
        </button>

<button
  style={{
    ...styles.button,
    padding: '16px 50px',
    marginTop: '1rem',
    backgroundColor: 'rgb(99, 43, 44)',
    transition: 'all 0.3s ease-in-out',
  }}
  onClick={() => navigate('/')}
  onMouseOver={(e) => {
    e.target.style.backgroundColor = 'rgb(112, 71, 72)';
    e.target.style.transform = 'scale(1.05)';
  }}
  onMouseOut={(e) => {
    e.target.style.backgroundColor = 'rgb(99, 43, 44)';
    e.target.style.transform = 'scale(1)';
  }}
>
  Go back
</button>


        {isPlaying && (
          <div style={styles.voiceBars}>
            <div style={{ ...styles.bar, height: '16px', animationDelay: '0s' }} />
            <div style={{ ...styles.bar, height: '24px', animationDelay: '0.2s' }} />
            <div style={{ ...styles.bar, height: '18px', animationDelay: '0.4s' }} />
          </div>
        )}
      </div>

      {/* 🌐 Keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.8); }
        }

        @keyframes wavePulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
          70% { opacity: 0.2; }
          100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
        }

        .voice-circle {
          width: 240px;
          height: 240px;
          border-radius: 50%;
          background: rgba(123, 104, 238, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .voice-waves {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }

        .wave {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
          animation: wavePulse 4s infinite;
        }

        .wave-1 { width: 280px; height: 280px; animation-delay: 0s; }
        .wave-2 { width: 320px; height: 320px; animation-delay: 1s; }
        .wave-3 { width: 360px; height: 360px; animation-delay: 2s; }
      `}</style>
    </div>
  );
};



const styles = {
  container: {
    background: 'linear-gradient(to right, rgb(29, 2, 2), rgb(34, 4, 4))',
    color: '#fff',
    minHeight: '100vh',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '"Segoe UI", sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  visualization: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 0,
  },
  card: {
    zIndex: 2,
    background: 'rgba(59, 5, 5, 0.9)',
    backdropFilter: 'blur(16px)',
    padding: '3rem 2rem',
    borderRadius: '24px',
    boxShadow: '0 12px 28px rgba(240, 173, 173, 0.79)',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
    position: 'relative',
    border: '1px solid rgba(92, 46, 46, 0.64)',
  },
  heading: {
    fontSize: '2.4rem',
    marginBottom: '1rem',
    fontWeight: '700',
  },
  emailCount: {
    fontSize: '1.1rem',
    marginBottom: '1.5rem',
    color: '#ffd966',
    fontWeight: '500',
  },
  infoText: {
    fontSize: '0.95rem',
    marginBottom: '2rem',
    color: '#dddddd',
    lineHeight: '1.6',
  },
  button: {
    padding: '14px 36px',
    backgroundColor: 'rgb(99, 43, 44)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(187, 148, 149, 0.4)',
    transition: 'all 0.25s ease-in-out',
  },
  muteButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'transparent',
    color: 'white',
    border: 'none',
    fontSize: '1.6rem',
    cursor: 'pointer',
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
};

export default Dashboard;
