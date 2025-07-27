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
  'recruitment', 'placement', 'hiring','hackathon','Congratulations','congratulations',
  'selected','Selected'
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
    return "📝 Exam season alert! Breathe in... You’ve GOT this! Deep breath. Let’s check what it is.";
  }

  if (
    lowerText.includes("deadline") || lowerText.includes("submit") ||
    lowerText.includes("submission") || lowerText.includes("due") ||
    lowerText.includes("urgent")
  ) {
    return "⏳ Uh-oh! A deadline is looming! Let's check it before it slips away. 🏃‍♂️💨";
  }

  if (
    lowerText.includes("meeting") || lowerText.includes("zoom") || 
    lowerText.includes("calendar") || lowerText.includes("invite") ||
    lowerText.includes("reminder")
  ) {
    return "📅 Incoming meeting alert... Should we act cool or actually prepare? 😅";
  }

  if (
    lowerText.includes("selected") || lowerText.includes("shortlisted") || 
    lowerText.includes("winner") || lowerText.includes("congrats") || 
    lowerText.includes("accepted")
  ) {
    return "🎉 OOOOH! Big news alert! You might’ve just been selected! Open it... before I explode with excitement! 🎊";
  }

  if (
    lowerText.includes("sorry") || lowerText.includes("unfortunately") || 
    lowerText.includes("rejected") || lowerText.includes("declined")
  ) {
    return "💔 Hmm... This might be one of those tough ones. But hey, we got this. Let’s take a look together.";
  }

  if (
    lowerText.includes("newsletter") || lowerText.includes("update") || 
    lowerText.includes("digest") || lowerText.includes("recap")
  ) {
    return "📰 Newsletter or recap time. Should we skim through or snooze it?";
  }

  if (
    lowerText.includes("invoice") || lowerText.includes("payment") ||
    lowerText.includes("bill") || lowerText.includes("transaction")
  ) {
    return "💸 Money matters! Time to check if you're ballin' or... broke. 😬";
  }

  if (
    lowerText.includes("offer") || lowerText.includes("discount") || 
    lowerText.includes("deal") || lowerText.includes("sale")
  ) {
    return "🛍️ Ooooh, juicy offers spotted! Should we check if it's worth the splurge?";
  }

  if (
    lowerText.includes("birthday") || lowerText.includes("celebration") || 
    lowerText.includes("party")
  ) {
    return "🎂 Looks like someone’s throwing a party! Let’s see what’s poppin’! 🎈";
  }

  if (
    lowerText.includes("security alert") || lowerText.includes("unauthorized") || 
    lowerText.includes("account") || lowerText.includes("reset password")
  ) {
    return "🚨 Security alert. Might be serious. Let’s peek quickly and make sure all is well.";
  }

  return "📬 You've got a new email! Curious to see what it says?";
}



// 🧠 Emotional + Motivational Voice Summary Generator
const generateVoiceSummary = (emails) => {
  const unreadEmails = emails.length;

  const priorityEmails = emails.filter(email =>
    matchesPriority(email.subject) || matchesPriority(email.snippet)
  );

  const deadlineEmails = priorityEmails.filter(email =>
    /deadline|submission|due|reminder/i.test(email.subject + email.snippet)
  );

  const meetingEmails = priorityEmails.filter(email =>
    /meeting|call|schedule|invite/i.test(email.subject + email.snippet)
  );

  const invoiceEmails = priorityEmails.filter(email =>
    /invoice|payment|billing/i.test(email.subject + email.snippet)
  );

  const highlights = priorityEmails.slice(0, 3).map(mail =>
    mail.subject?.split(':')[0] || 'an important email'
  );

  // 🎤 Emotion-based speech logic
  if (unreadEmails === 0) {
    return `Hey Heeral, no new emails right now — you're all caught up! Take a breath and enjoy the calm ✨`;
  }

  if (priorityEmails.length === 0) {
    return `You’ve got ${unreadEmails} new emails, but none seem urgent. Relax and check them when you can ☕️`;
  }

  let message = `Hi Heeral! You’ve received ${unreadEmails} new emails — and ${priorityEmails.length} of them seem pretty important.`;

  if (deadlineEmails.length > 0) {
    message += ` ⚠️ Heads up — ${deadlineEmails.length} email${deadlineEmails.length > 1 ? 's' : ''} mention a *deadline* or *submission*. Stay sharp!`;
  }

  if (meetingEmails.length > 0) {
    message += ` 📅 Also, ${meetingEmails.length} email${meetingEmails.length > 1 ? 's' : ''} talk about *meetings* or *calls*. Might wanna review your calendar.`;
  }

  if (invoiceEmails.length > 0) {
    message += ` 💰 And there are ${invoiceEmails.length} about *invoices* or *payments*. Just in case there's something financial you need to sort.`;
  }

  message += ` Here's a quick peek: ${highlights.join(', ')}. You've got this! 💪`;

  return message;
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
   voice_id : "bn-IN-abhik",
  style : "Conversational",
  multi_native_locale :"en-IN"
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
       voice_id : "bn-IN-abhik",
  style :"Conversational",
  multi_native_locale :"en-IN"
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