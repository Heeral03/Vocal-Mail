// 🧠 SAME IMPORTS
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaEnvelopeOpenText } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { ImSpinner8 } from 'react-icons/im';

const EmailList = () => {
  const [categorizedEmails, setCategorizedEmails] = useState({});
  const [priorityEmails, setPriorityEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [currentAudio, setCurrentAudio] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/emails');
        const data = await response.json();

        setPriorityEmails(data.priorityEmails || []);
        setCategorizedEmails(data.categorizedEmails || []);

        if (data.priorityEmails?.length > 0) {
          summarizeAndSpeakPriorityEmails(data.priorityEmails);
        }
      } catch (err) {
        console.error("❌ Error fetching emails:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes pulseGlow {
        0% {
          box-shadow: 0 0 10px rgba(192, 158, 158, 0.6), 0 0 20px rgba(92, 67, 67, 0.5), 0 0 30px rgba(255, 255, 255, 0.4);
        }
        50% {
          box-shadow: 0 0 15px rgba(121, 78, 78, 0.8), 0 0 30px rgba(255, 255, 255, 0.7), 0 0 45px rgba(255, 255, 255, 0.6);
        }
        70% {
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.4);
        }
      }
      .spin { animation: spin 1s linear infinite; }
      .card-hover {
        transition: transform 0.3s ease-in-out;
      }
      .card-hover:hover {
        animation: pulseGlow 1.5s infinite;
        transform: scale(1.02) translateY(-4px);
      }
      .btn-hover:hover {
        filter: brightness(1.2);
        transition: filter 0.2s ease;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const handlePlay = async (text, index) => {
    handleStop();
    setPlayingIndex(index);
    try {
      const response = await fetch('http://localhost:5000/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (data.audio_url) {
        const audio = new Audio(data.audio_url);
        audio.play();
        setCurrentAudio(audio);
        audio.onended = () => {
          setPlayingIndex(null);
          setCurrentAudio(null);
        };
      }
    } catch (err) {
      console.error("TTS error:", err);
    }
  };

  const handleStop = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setPlayingIndex(null);
  };

  const summarizeAndSpeakPriorityEmails = async (emails) => {
    if (!emails.length) return;

    try {
      const response = await fetch('http://localhost:5000/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails })
      });

      const data = await response.json();
      if (data.summary) {
        const message = `You have ${emails.length} priority email${emails.length > 1 ? 's' : ''}. ${data.summary}`;

        const speakResponse = await fetch('http://localhost:5000/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message })
        });

        const audioData = await speakResponse.json();
        if (audioData.audioUrl) {
          const audio = new Audio(audioData.audioUrl);
          audio.play();
          setCurrentAudio(audio);
          audio.onended = () => setCurrentAudio(null);
        }
      }
    } catch (err) {
      console.error('Summarization or TTS failed:', err);
    }
  };

  const renderEmail = (email, index) => (
    <div key={index} style={styles.card} className="card-hover">
      <div style={styles.cardHeader}>
        <MdEmail size={22} color="#ffc6c6" />
        <span style={styles.categoryTag}>{email.category || 'Other'}</span>
        {priorityEmails.includes(email) && (
          <span style={styles.priorityBadge}>Priority</span>
        )}
      </div>

      <div style={styles.cardContent}>
        <p><strong>From:</strong> {email.from}</p>
        <p><strong>Subject:</strong> {email.subject}</p>
      </div>

      <div style={styles.cardActions}>
        {playingIndex === index ? (
          <>
            <button onClick={handleStop} style={styles.stopBtn} className="btn-hover">
               Stop
            </button>
            <a
              href={`https://mail.google.com/mail/u/0/#inbox/${email.threadId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.openBtn}
              className="btn-hover"
            >
              <FaEnvelopeOpenText /> Open
            </a>
          </>
        ) : (
          <>
            <button
              onClick={() => handlePlay(email.subject + '. ' + (email.snippet || ""), index)}
              style={styles.playBtn}
              className="btn-hover"
            >
              <FaPlay /> Play
            </button>
            <a
              href={`https://mail.google.com/mail/u/0/#inbox/${email.threadId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.openBtn}
              className="btn-hover"
            >
              <FaEnvelopeOpenText /> Open
            </a>
          </>
        )}
      </div>
    </div>
  );

  const renderCategorySection = () => {
    return Object.keys(categorizedEmails).map((category, catIndex) => {
      if (category === 'Priority') return null;

      const isExpanded = expandedCategories[category] || false;

      return (
        <div key={catIndex} style={styles.section}>
          <div style={styles.categoryHeader}>
            <h3 style={styles.sectionTitle}>{category}</h3>
            <button
              style={styles.toggleButton}
              onClick={() =>
                setExpandedCategories((prev) => ({
                  ...prev,
                  [category]: !prev[category]
                }))
              }
              className="btn-hover"
            >
              {isExpanded ? 'Hide Emails' : 'Show Emails'}
            </button>
          </div>

          {isExpanded && (
            <div style={styles.grid}>
              {categorizedEmails[category].map(renderEmail)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => navigate('/dashboard')}
        style={styles.backButton}
        className="btn-hover"
      >
        ← Back to Dashboard
      </button>

      {currentAudio && (
        <button
          onClick={handleStop}
          style={{
            marginBottom: '1.5rem',
            padding: '0.6rem 1.2rem',
            backgroundColor: 'rgb(144, 46, 46)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.25)'
          }}
          className="btn-hover"
        >
          Stop All Audio
        </button>
      )}

      {loading ? (
        <p style={{ color: '#fff' }}>Loading emails...</p>
      ) : (
        <>
          {priorityEmails.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Priority Emails</h3>
              <div style={styles.grid}>
                {priorityEmails.map(renderEmail)}
              </div>
            </div>
          )}

          {Object.keys(categorizedEmails).length > 0 ? (
            renderCategorySection()
          ) : (
            <p>No emails found.</p>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, rgb(46, 6, 6), rgb(17, 0, 0))',
    fontFamily: 'Segoe UI, sans-serif',
    color: 'rgb(199, 168, 168)'
  },
  backButton: {
    marginBottom: '1.5rem',
    padding: '0.6rem 1.2rem',
    backgroundColor: 'rgb(161, 96, 96)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  },
  section: {
    marginTop: '2rem'
  },
  sectionTitle: {
    fontSize: '1.6rem',
    color: 'rgb(255, 213, 200)',
    marginBottom: '1rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: 'rgba(49, 10, 10, 0.05)',
    borderRadius: '14px',
    padding: '1.2rem',
    boxShadow: '0 4px 12px rgba(114, 54, 54, 0.49)',
    border: '0.5px solid rgb(85, 76, 76)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'box-shadow 0.3s ease-in-out'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    marginBottom: '0.6rem'
  },
  categoryTag: {
    fontSize: '0.85rem',
    color: 'rgb(211, 187, 187)',
    background: 'rgb(91, 44, 44)',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px'
  },
  priorityBadge: {
    backgroundColor: 'rgba(192, 143, 143, 0.38)',
    color: '#fff',
    padding: '0.1rem 0.4rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    marginLeft: 'auto',
    fontWeight: 'bold'
  },
  cardContent: {
    flexGrow: 1,
    marginBottom: '1rem'
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.6rem'
  },
  playBtn: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: 'rgb(169, 68, 68)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem'
  },
  stopBtn: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: 'rgb(110, 32, 32)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  openBtn: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: 'rgb(90, 44, 44)',
    color: '#fff',
    textAlign: 'center',
    borderRadius: '8px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem'
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.8rem'
  },
  toggleButton: {
    backgroundColor: 'rgb(119, 67, 67)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.4rem 0.8rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    transition: 'background-color 0.3s ease'
  }
};

export default EmailList;
