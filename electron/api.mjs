import axios from 'axios';
import express from 'express';
import cors from 'cors';
import { fetchEmails } from './fetchEmails.mjs';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 🧠 Emotion-based context prefix generator
function getEmotionalContext(text) {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('quiz') || lowerText.includes('test') || lowerText.includes('exam')) {
    return "Hey Heeral, this seems important! 📚 ";
  } else if (lowerText.includes('deadline') || lowerText.includes('submit') || lowerText.includes('Security alert')) {
    return "⚠️ Heads up Heeral! You might want to note this. ";
  } else if (lowerText.includes('meeting') || lowerText.includes('join')) {
    return "📅 Looks like you have something scheduled. ";
  } else if (lowerText.includes('congratulations') || lowerText.includes('selected')) {
    return "🎉 Wow! Great news, Heeral. ";
  } else if (lowerText.includes('sorry') || lowerText.includes('unfortunately')) {
    return "Oh no... here's something you may not like. ";
  } else {
    return "Here's what your email says: ";
  }
}

// 📩 Endpoint to fetch emails
app.post('/api/emails', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Missing access token' });
  }

  try {
    const gmailRes = await axios.get(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const messages = gmailRes.data.messages || [];

    const emailDetails = await Promise.all(
      messages.map(async (msg) => {
        const msgRes = await axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const payload = msgRes.data.payload || {};
        const headers = payload.headers || [];
        const subjectHeader = headers.find((h) => h.name === 'Subject');
        const fromHeader = headers.find((h) => h.name === 'From');

        return {
          subject: subjectHeader?.value || "(No subject)",
          from: fromHeader?.value || "(Unknown sender)",
          snippet: msgRes.data.snippet,
        };
      })
    );

    res.json(emailDetails);
  } catch (err) {
    console.error("❌ Error fetching emails from Gmail:", err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch Gmail emails' });
  }
});


// 🔊 TTS Endpoint with emotional context
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  console.log("📥 TTS request received:", text);

  if (!text) {
    return res.status(400).json({ error: 'Text is required for TTS' });
  }

  const prefix = getEmotionalContext(text);
  const finalText = prefix + text;

  const payload = {
    text: finalText,
    voiceId: 'bn-IN-arnab',
    style: 'Conversational',
    multiNativeLocale: 'en-IN',
  };

  try {
    const response = await axios.post(
      'https://api.murf.ai/v1/speech/generate',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'api-key': 'ap2_fa7778cf-9bde-4cef-9161-67f10992a345',
        },
      }
    );

    const audioUrl = response?.data?.audioFile;
    if (!audioUrl) {
      console.error("❌ Murf response missing audioFile:", response.data);
      return res.status(502).json({ error: 'No audio file returned from TTS provider' });
    }

    res.json({ audio_url: audioUrl });
  } catch (error) {
    console.error('❌ Error generating TTS:', error?.response?.data || error.message);
    res.status(500).json({ error: 'TTS generation failed' });
  }
});

// 🚀 Server started log
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// ⛑️ Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// 🔥 Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💣 Uncaught Exception thrown:', err);
  process.exit(1); // optional: shut down server on fatal exception
});

// 📤 Listen for process exit events
process.on('exit', (code) => {
  console.log(`👋 Process exiting with code: ${code}`);
});

// 👋 Log when SIGINT/SIGTERM received (like Ctrl+C)
process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down...');
  process.exit(0);
});
setInterval(() => {}, 1 << 30);
