import React, { useEffect, useState } from 'react';

const EmailList = () => {
  const [priorityEmails, setPriorityEmails] = useState([]);
  const [otherEmails, setOtherEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState(null);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/emails');
        const data = await response.json();
        console.log("📨 Email API response:", data);
        const priority = data.priorityEmails || [];
        setPriorityEmails(priority);
        setOtherEmails(data.otherEmails || []);

        if (priority.length > 0) {
          summarizeAndSpeakPriorityEmails(priority);
        }
      } catch (err) {
        console.error("❌ Error fetching emails:", err);
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
        body: JSON.stringify({ text })
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

  const summarizeAndSpeakPriorityEmails = async (emails) => {
    if (!emails.length) return;

    try {
      const response = await fetch('http://localhost:5000/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emails.slice(0, 3) }) // limit to top 3
      });

      const data = await response.json();

      if (data.summary) {
        const summaryIntro = `You have ${emails.length} priority email${emails.length > 1 ? 's' : ''}. Here's a quick summary.`;
        const fullMessage = `${summaryIntro} ${data.summary}`;

        const speakResponse = await fetch('http://localhost:5000/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: fullMessage })
        });

        const audioData = await speakResponse.json();
        if (audioData.audioUrl) {
          const audio = new Audio(audioData.audioUrl);
          audio.play();
        } else {
          console.error("❌ Failed to get audio from Murf");
        }
      } else {
        console.error("⚠️ No summary received");
      }
    } catch (err) {
      console.error('💥 Summarization or TTS failed:', err);
    }
  };

  const renderEmail = (email, index) => (
    <li key={index} style={{
      border: '1px solid #444',
      borderRadius: '12px',
      padding: '1.2rem',
      marginBottom: '1.5rem',
      backgroundColor: 'rgba(63, 20, 20, 0.61)',
      boxShadow: '0 0 10px rgba(207, 191, 191, 0.5)'
    }}>
      <div style={{ marginBottom: '0.8rem' }}>
        <strong style={{ color: '#99ccff' }}>From:</strong> {email.from} <br />
        <strong style={{ color: '#99ccff' }}>Subject:</strong> {email.subject}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Play Button */}
        <button
          onClick={() => handlePlay(email.subject + '. ' + (email.snippet || ""), index)}
          style={{
            padding: '0.2rem 1rem',
            background: 'linear-gradient(135deg, rgb(121, 41, 65), rgb(148, 71, 71))',
            color: '#fcefe3',
            border: '1px solid rgb(139, 109, 109)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(165, 92, 92, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={e => {
            e.target.style.background = 'linear-gradient(135deg, rgb(165, 85, 100), rgb(120, 50, 50))';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseOut={e => {
            e.target.style.background = 'linear-gradient(135deg, rgb(121, 41, 65), rgb(148, 71, 71))';
            e.target.style.transform = 'scale(1)';
          }}
        >
          {playingIndex === index ? " Playing..." : " Play"}
        </button>

        {/* Read Mail Button */}
        <a
          href={`https://mail.google.com/mail/u/0/#inbox/${email.threadId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '0.3rem 1.2rem',
            background: 'linear-gradient(135deg, rgb(121, 41, 65), rgb(148, 71, 71))',
            color: '#fcefe3',
            border: '1px solid rgb(139, 109, 109)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(165, 92, 92, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={e => {
            e.target.style.background = 'linear-gradient(135deg, rgb(165, 85, 100), rgb(120, 50, 50))';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseOut={e => {
            e.target.style.background = 'linear-gradient(135deg, rgb(121, 41, 65), rgb(148, 71, 71))';
            e.target.style.transform = 'scale(1)';
          }}
        >
          Read the Mail
        </a>
      </div>
    </li>
  );

  return (
    <div style={{
      padding: '2rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgb(32, 3, 3), rgb(48, 2, 2))',
      color: '#fff',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      {loading ? (
        <p>Loading emails...</p>
      ) : (
        <>
          {priorityEmails.length > 0 && (
            <>
              <h3 style={{ color: '#ffcccb', fontSize: '1.5rem', marginBottom: '1rem' }}> Priority Emails</h3>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {priorityEmails.map(renderEmail)}
              </ul>
            </>
          )}

          {otherEmails.length > 0 && (
            <>
              <h3 style={{ color: '#ccf2ff', fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Other Emails</h3>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {otherEmails.map(renderEmail)}
              </ul>
            </>
          )}

          {priorityEmails.length === 0 && otherEmails.length === 0 && <p>No emails found.</p>}
        </>
      )}
    </div>
  );
};

export default EmailList;
