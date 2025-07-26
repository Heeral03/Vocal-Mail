import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { authorizeGmail } from './oauth.mjs'; // Gmail OAuth logic
import { summarizeEmailsWithOpenRouter } from './summarize.mjs';


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

// 📢 Emotional Context
function getEmotionalContext(text) {
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes("quiz") || lowerText.includes("exam") || lowerText.includes("test") ||
    lowerText.includes("assignment") || lowerText.includes("term")
  ) {
    return "📝 Exam season alert! Breathe in… you’ve faced tougher. Shall we dive in?";
  }

  if (
    lowerText.includes("deadline") || lowerText.includes("submit") ||
    lowerText.includes("submission") || lowerText.includes("due") ||
    lowerText.includes("urgent")
  ) {
    return "⏳ Deadline chase detected! Let's catch it before it escapes 🏃‍♀️💨";
  }

  if (
    lowerText.includes("meeting") || lowerText.includes("zoom") || 
    lowerText.includes("calendar") || lowerText.includes("invite") ||
    lowerText.includes("reminder")
  ) {
    return "📅 Meeting vibes incoming! Should we pretend to care? 😅 Or actually prep?";
  }

  if (
    lowerText.includes("selected") || lowerText.includes("shortlisted") || 
    lowerText.includes("winner") || lowerText.includes("congrats") || 
    lowerText.includes("accepted")
  ) {
    return "🎉 WOOHOOO! This might be BIG! Open it before I pop confetti! 🎊";
  }

  if (
    lowerText.includes("sorry") || lowerText.includes("unfortunately") || 
    lowerText.includes("rejected") || lowerText.includes("declined")
  ) {
    return "💔 Oof. Might be one of *those* emails. But hey, we face it together 💪";
  }

  if (
    lowerText.includes("newsletter") || lowerText.includes("update") || 
    lowerText.includes("digest") || lowerText.includes("recap")
  ) {
    return "📰 Just your daily scroll bait. TL;DR it?";
  }

  if (
    lowerText.includes("invoice") || lowerText.includes("payment") ||
    lowerText.includes("bill") || lowerText.includes("transaction")
  ) {
    return "💸 Money stuff! Let’s check if you're broke or balling 😅";
  }

  if (
    lowerText.includes("offer") || lowerText.includes("discount") || 
    lowerText.includes("deal") || lowerText.includes("sale")
  ) {
    return "🛍️ It’s raining offers again! Wanna splurge or scroll past?";
  }

  if (
    lowerText.includes("birthday") || lowerText.includes("celebration") || 
    lowerText.includes("party")
  ) {
    return "🎂 Looks like party time! Let’s check what’s cooking!";
  }

  if (
    lowerText.includes("security alert") || lowerText.includes("unauthorized") || 
    lowerText.includes("account") || lowerText.includes("reset password")
  ) {
    return "🔐 Security alert 🚨 — might be serious. Let's peek quickly!";
  }

  return "📬 A fresh email just landed! Shall we explore it together?";
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


function categorizeEmail(email) {
  const text = `${email.subject} ${email.snippet}`.toLowerCase();

  const categoryMap = {
    'Placement & Career': [
      'placement', 'internship', 'job', 'recruitment', 'interview', 'career', 'shortlist', 'selected'
    ],
    'Quizzes & Exams': [
      'quiz', 'exam', 'test', 'assessment', 'assignment', 'marks', 'grades', 'result', 'syllabus','term','Term','midterm','Midterm','endterm','Endterm'
    ],
    'Finance': [
      'transaction', 'upi', 'payment', 'account', 'invoice', 'salary', 'scholarship', 'bank', 'refund', 'bill'
    ],
    'Promotional': [
      'deal', 'offer', 'discount', 'coupon', 'sale', 'save', 'bargain', 'limited time'
    ],
    'E-commerce': [
      'flipkart', 'amazon', 'myntra', 'order', 'shipped', 'delivered', 'delivery', 'tracking'
    ],
    'Social Media': [
      'facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'snapchat', 'tiktok','connect'
    ],
    'Meetings & Events': [
      'meeting', 'zoom', 'calendar', 'invite', 'webinar', 'event', 'google meet', 'teams'
    ],
    'Academic Updates': [
      'professor', 'class', 'lecture', 'notes', 'material', 'syllabus', 'timetable', 'course'
    ],
    'Security': [
      'security', 'unauthorized', 'login', 'password', 'suspicious', 'alert', 'account locked'
    ],
    'Celebration': [
      'birthday', 'anniversary', 'party', 'celebration', 'invite'
    ],
    'Updates & Newsletters': [
  'newsletter', 'update', 'digest', 'recap', 'weekly', 'summary',
  'usage', 'api usage', 'account activity', 'plan', 'upgrade', 'subscription', 'limit', 'quota',
  

    ]
  };

  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return 'Other';
}

// 📩 Gmail Inbox Endpoint
app.get('/api/emails', async (req, res) => {
  console.log("📥 /api/emails called");

  try {
    const { token, emailData } = await authorizeGmail();

    // 1. Add category to each email
emailData.forEach(email => {
  email.category = categorizeEmail(email); // 🆕
});

// 2. Sort into priority / other
const priorityEmails = emailData.filter(email =>
  matchesPriority(email.subject) || matchesPriority(email.snippet)
);

const otherEmails = emailData.filter(email =>
  !matchesPriority(email.subject) && !matchesPriority(email.snippet)
);

// 3. Also categorize into groupings
const categorizedEmails = {};
emailData.forEach(email => {
  const category = email.category || 'Other';
  if (!categorizedEmails[category]) {
    categorizedEmails[category] = [];
  }
  categorizedEmails[category].push(email);
});


    const summary = generateVoiceSummary(emailData);

    res.json({
  token,
  priorityEmails,
  otherEmails,
  categorizedEmails,  // 🆕 for your category UI
  summary
});

  } catch (error) {
    console.error("❌ Failed to fetch emails:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🔎 Gemini Email Summarization Endpoint
// 🔎 Email Summarization Endpoint (via OpenRouter)
app.post('/summarize', async (req, res) => {
  const { emails } = req.body;

  try {
    const summary = await summarizeEmailsWithOpenRouter(emails);

    if (!summary) {
      throw new Error("Summarization failed");
    }

    res.json({ summary });
  } catch (error) {
    console.error("❌ Summarization Error:", error.message);
    res.status(500).json({ error: "Failed to summarize emails" });
  }
});

// 🧠 TTS with emotional prefix
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  console.log("📥 /api/tts request received:", text);

  if (!text) return res.status(400).json({ error: 'Text is required for TTS' });

  const prefix = getEmotionalContext(text);
  const finalText = `${prefix} ${text}`;

  const payload = {
    text: finalText,
    voiceId: 'bn-IN-arnab',
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
          'api-key': 'ap2_e347a8a8-e3a3-4103-b64e-5446a1e99d94',
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

// 🗣️ Simple /speak endpoint for welcome messages
app.post("/speak", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await axios.post(
      "https://api.murf.ai/v1/speech/generate",
      {
        text: text,
        voiceId: 'bn-IN-arnab',
        style: 'Conversational',
        multiNativeLocale: 'en-IN'
      },
      {
        headers: {
          "api-key": "ap2_e347a8a8-e3a3-4103-b64e-5446a1e99d94",
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

// 🌐 Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// 🧯 Error handling
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