import axios from 'axios';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { authorizeGmail } from './oauth.mjs'; // Gmail OAuth logic
import { summarizeEmailsWithTogether } from './summarize.mjs';
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚨 KEYWORDS TO DETECT PRIORITY EMAILS
const priorityKeywords = [
  'quiz', 'exam', 'test', 'submission', 'midterm', 'endterm',
  'deadline', 'interview', 'oa', 'assessment', 'pending',
  'shortlist', 'shortlisted', 'selected',
  'recruitment', 'placement', 'hiring','hackathon',

];

const matchesPriority = (text = '') =>
  priorityKeywords.some(keyword => text.toLowerCase().includes(keyword));

// 📢 Emotional Context (Optional but cool)
function getEmotionalContext(text) {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('quiz') || lowerText.includes('test') || lowerText.includes('exam') ||lowerText.includes('term') ) {
    return "📝 Quiz/test vibes detected! Deep breath — you’ve totally got this!";
  }

  if (lowerText.includes('deadline') || lowerText.includes('submit') || lowerText.includes('security alert')) {
    return "⏳ Something time-sensitive popped up! Let’s peek before it becomes a last-minute panic!";
  }

  if (lowerText.includes('meeting') || lowerText.includes('zoom') || lowerText.includes('calendar')) {
    return "📅 A meeting alert, huh? Let’s check if it’s something you need to prep for.";
  }

  if (lowerText.includes('selected') || lowerText.includes('shortlisted') || lowerText.includes('winner')) {
    return "🎉 OMG !! This sounds like a win! Let’s open it together 🥳✨";
  }

  if (lowerText.includes('sorry') || lowerText.includes('unfortunately')) {
    return "💔 This one might be tough. Want me to sit with you while we go through it?";
  }

  if (lowerText.includes('newsletter') || lowerText.includes('update') || lowerText.includes('digest')) {
    return "📰 Just a newsletter. Want the TL;DR or should we skim it?";
  }

  return "📬 A fresh email is here! Wanna explore it together?";
}

// 🔊 Voice Summary Generator
const generateVoiceSummary = (emails) => {
  const unreadEmails = emails.length;
  const priorityEmails = emails.filter(email =>
    matchesPriority(email.subject) || matchesPriority(email.snippet)
  );

  const highlights = priorityEmails.slice(0, 3).map(mail => mail.subject?.split(':')[0] || 'an important email');
  return `Hi ! You have ${unreadEmails} new emails, ${priorityEmails.length} of which are urgent — including ${highlights.join(', ')}.`;
};

// 📩 Gmail Inbox Endpoint
app.get('/api/emails', async (req, res) => {
  console.log("📥 /api/emails called");

  try {
    const { token, emailData } = await authorizeGmail();

    const priorityEmails = emailData.filter(email =>
      matchesPriority(email.subject) || matchesPriority(email.snippet)
    );

    const otherEmails = emailData.filter(email =>
      !matchesPriority(email.subject) && !matchesPriority(email.snippet)
    );

    const summary = generateVoiceSummary(emailData);

    res.json({ token, priorityEmails, otherEmails, summary });
  } catch (error) {
    console.error("❌ Failed to fetch emails:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🧠 Smart TTS (Emotion + Voice)
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  console.log("📥 /api/tts request received:", text);

  if (!text) return res.status(400).json({ error: 'Text is required for TTS' });

  const prefix = getEmotionalContext(text);
  const finalText = `${prefix} ${text}`;

  const payload = {
    text: finalText,
    voiceId: 'bn-IN-arnab', // Use your desired Murf voice
    style: 'Conversational',
    multiNativeLocale: 'en-IN'
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
      console.error("❌ Murf response missing audioFile");
      return res.status(502).json({ error: 'No audio returned' });
    }

    res.json({ audio_url: audioUrl });
  } catch (error) {
    console.error('❌ Error generating TTS:', error?.response?.data || error.message);
    res.status(500).json({ error: 'TTS generation failed' });
  }
});


app.post('/summarize', async (req, res) => {
  const emails = req.body.emails;
  if (!emails || !emails.length) return res.status(400).json({ error: 'No emails provided' });

  const summary = await summarizeEmailsWithTogether(emails);
  if (summary) {
    res.json({ summary });
  } else {
    res.status(500).json({ error: 'Failed to summarize emails' });
  }
});


// 🗣️ Simple /speak endpoint for plain welcome message
app.post("/speak", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await axios.post(
      "https://api.murf.ai/v1/speech/generate",
      {
        text: text,
        voiceId: 'bn-IN-arnab', // Use your desired Murf voice
    style: 'Conversational',
    multiNativeLocale: 'en-IN'
      },
      {
        headers: {
          "api-key": "ap2_fa7778cf-9bde-4cef-9161-67f10992a345",
          "Content-Type": "application/json"
        }
      }
    );

    const audioUrl = response.data?.audioFile;
    if (!audioUrl) {
      return res.status(500).json({ error: "No audio returned" });
    }

    res.json({ audioUrl });
  } catch (err) {
    console.error("Murf /speak API error:", err.message);
    res.status(500).send("Error generating speech");
  }
});

// 🌐 Server startup
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// 🧯 Error & Exit handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('💣 Uncaught Exception:', err);
  process.exit(1);
});
process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Exiting...');
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Exiting...');
  process.exit(0);
});
setInterval(() => {}, 1 << 30); // keep server alive
