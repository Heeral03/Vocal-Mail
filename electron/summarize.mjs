import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function summarizeEmailsWithOpenRouter(emails) {
  // Filter priority emails (customize this logic as per your app)
  const priorityEmails = emails.filter(email =>
    email.subject?.toLowerCase().includes('important') ||
    email.snippet?.toLowerCase().includes('meeting') ||
    email.snippet?.toLowerCase().includes('invoice') ||
    email.snippet?.toLowerCase().includes('submission') ||
    email.snippet?.toLowerCase().includes('urgent')
  );

  // If no priority emails, fallback to top 5
  const selectedEmails = priorityEmails.length > 0 ? priorityEmails.slice(0, 5) : emails.slice(0, 5);

  const formattedPrompt = `Summarize the following emails in 3-4 sentences. Mention key senders, subjects, and relevant information:\n\n` +
    selectedEmails.map((email, idx) =>
      `Email ${idx + 1}:\nFrom: ${email.from}\nSubject: ${email.subject}\nBody: ${email.snippet}\n`
    ).join('\n');

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes emails.",
        },
        {
          role: "user",
          content: formattedPrompt,
        },
      ],
      temperature: 0.7,
    }, {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // or your app’s domain
        "X-Title": "VocalMail Summary",
      },
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("❌ OpenRouter API Error:", error.response?.data || error.message);
    return null;
  }
}
