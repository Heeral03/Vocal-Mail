import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

function getCleanSenderName(email) {
  if (!email) return 'Unknown Sender';
  const nameMatch = email.match(/^(.*?)\s*</);
  if (nameMatch && nameMatch[1].trim().length > 0) {
    return nameMatch[1].trim();
  }
  const domainMatch = email.match(/@([a-zA-Z0-9.-]+)\./);
  return domainMatch ? domainMatch[1] : email.split('@')[0].replace(/[-_].*/, '');
}


export async function summarizeEmailsWithOpenRouter(emails) {
  const priorityEmails = emails.filter(email =>
    email.subject?.toLowerCase().includes('important') ||
    email.snippet?.toLowerCase().includes('meeting') ||
    email.snippet?.toLowerCase().includes('invoice') ||
    email.snippet?.toLowerCase().includes('submission') ||
    email.snippet?.toLowerCase().includes('urgent')
  );

  const selectedEmails = priorityEmails.length > 0 ? priorityEmails.slice(0, 5) : emails.slice(0, 5);

 const formattedPrompt = `You are a friendly and emotionally aware assistant who not just reads the emails but understand them on emotional and deeper level.

 Summarize the following emails one by one and in not more than 2 sentences. Keep it short, crisp and to the point.
 Avoid reading out the emails as it is. 
 Show urgency when needed to the words like "Quiz", "Deadline","Submission","Exam" etc. 
 Avoid Repeatition - mention the subject.

Emails:\n\n` +
  selectedEmails.map((email, idx) =>
    `From: ${getCleanSenderName(email.from)}\nSubject: ${email.subject}\nBody: ${email.snippet}\n`
  ).join('\n\n');


  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes important emails.",
        },
        {
          role: "user",
          content: formattedPrompt,
        },
      ],
      temperature: 0.5,
    }, {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "VocalMail Summary",
      },
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("❌ OpenRouter API Error:", error.response?.data || error.message);
    return null;
  }
}
