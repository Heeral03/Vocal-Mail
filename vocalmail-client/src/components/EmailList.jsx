import React, { useEffect, useState } from 'react';

const EmailList = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState(null);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const token = localStorage.getItem('gmailAccessToken');

        const response = await fetch('http://localhost:5000/api/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        console.log("📥 Raw email response:", data);

        // Defensive: If data.emails exists and is an array, use it
        if (Array.isArray(data)) {
          setEmails(data);
        } else if (Array.isArray(data.emails)) {
          setEmails(data.emails);
        } else {
          console.warn("⚠️ Unexpected email data format:", data);
          setEmails([]);
        }
      } catch (err) {
        console.error("❌ Error fetching emails:", err);
        setEmails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  const handlePlay = async (text, index) => {
    setPlayingIndex(index);
    try {
      const response = await fetch('http://localhost:5000/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      console.log("🔊 TTS Response:", data);

      if (data.audio_url) {
        const audio = new Audio(data.audio_url);
        audio.play();
      } else {
        console.error("❌ Failed to get audio from TTS");
      }
    } catch (err) {
      console.error("TTS error:", err);
    } finally {
      setPlayingIndex(null);
    }
  };

  return (
    <div style={{
      padding: '2rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      color: '#fff',
      fontFamily: 'Segoe UI, sans-serif',
    }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>📬 Vocal Mailbox</h2>
      {loading ? (
        <p>Loading emails...</p>
      ) : emails.length === 0 ? (
        <p>No emails found.</p>
      ) : (
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {emails.map((email, index) => (
            <li key={index} style={{
              border: '1px solid #444',
              borderRadius: '12px',
              padding: '1.2rem',
              marginBottom: '1.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
            }}>
              <div style={{ marginBottom: '0.8rem' }}>
                <strong style={{ color: '#99ccff' }}>From:</strong> {email.from} <br />
                <strong style={{ color: '#99ccff' }}>Subject:</strong> {email.subject}
              </div>
              <button
                onClick={() => handlePlay(email.subject + '. ' + (email.snippet || ""), index)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#0059b3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  boxShadow: '0 0 5px #003d66',
                }}
              >
                {playingIndex === index ? "🔊 Playing..." : "🔊 Play"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmailList;
