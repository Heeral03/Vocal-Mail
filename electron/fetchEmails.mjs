// electron/fetchEmails.mjs
import { authorizeGmail } from './oauth.mjs';
import fetch from 'node-fetch'; // Ensure: npm install node-fetch
async function getUserInfo(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user info');
  }

  const data = await res.json();
  return data.email; // return email instead of name
}

export async function fetchEmails() {
  try {
    const auth = await authorizeGmail();
    const accessToken = auth?.credentials?.access_token;

    if (!accessToken) {
      console.error("❌ Access token not found in credentials.");
      return { emails: [], userName: null };
    }

    // Get user's actual name
    const userName = await getUserInfo(accessToken);

    console.log("📤 Sending token to backend:", accessToken.slice(0, 20) + "...");

    const response = await fetch('http://localhost:5000/api/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: accessToken }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Backend responded with non-OK status:", response.status, text);
      return { emails: [], userName };
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("❌ Unexpected response format:", data);
      return { emails: [], userName };
    }

    console.log(`✅ Successfully fetched ${data.length} emails.`);
    return { emails: data, userName };
  } catch (error) {
    console.error('❌ Error in fetchEmails.mjs:', error);
    return { emails: [], userName: null };
  }
}

