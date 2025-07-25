// electron/summarize.mjs
import axios from 'axios';

export async function summarizeEmailsWithTogether(emails) {
  const prompt = `Summarize the following emails in 3-4 sentences, mentioning key senders and subjects:\n\n` +
    emails.map((email, idx) =>
      `Email ${idx + 1}:\nFrom: ${email.from}\nSubject: ${email.subject}\nBody: ${email.snippet}\n`
    ).join('\n');

  try {
    const response = await axios.post('https://api.together.xyz/v1/chat/completions', {
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes emails.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
    }, {
      headers: {
        'Authorization': `Bearer tgp_v1_L58jtzWp0YCjksM8UBDsM-TSbQWD7_CPcwpMolH9-e8`,
        'Content-Type': 'application/json',
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Together API Error:', error.response?.data || error.message);
    return null;
  }
}
