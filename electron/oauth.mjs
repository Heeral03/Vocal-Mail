import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import readline from 'readline';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile', // <-- Add this
  'openid' // <-- Optional but good
];

const CREDENTIALS_PATH = path.join(process.cwd(), 'electron/credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'electron/token.json');

// ------------------------ AUTHENTICATION ------------------------

export async function authorizeGmail() {
  const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const redirect_uris = [process.env.GOOGLE_REDIRECT_URI];


  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  try {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    const emailData = await listEmails(oAuth2Client);
    return { token, emailData };
  } catch (err) {
    return await getNewToken(oAuth2Client);
  }
}

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this URL:\n', authUrl);

  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('\nEnter the code from that page here: ', async (code) => {
      rl.close();
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log('Token stored to', TOKEN_PATH);
        const emailData = await listEmails(oAuth2Client);
        resolve({ token: tokens, emailData });
      } catch (err) {
        reject(err);
      }
    });
  });
}

// ------------------------ FETCH EMAILS ------------------------

export async function listEmails(auth, maxResults = 50) {
  const gmail = google.gmail({ version: 'v1', auth });

  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    q: 'is:unread newer_than:1d',
    labelIds: ['INBOX'],
  });

  const messages = res.data.messages || [];
  if (messages.length === 0) {
    console.log('No new messages.');
    return [];
  }

  // Parallel fetch
  const emailPromises = messages.map(async (message) => {
    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
    });

    const headers = msg.data.payload.headers;
    const subject = headers.find((h) => h.name === 'Subject')?.value || '(No Subject)';
    const from = headers.find((h) => h.name === 'From')?.value || '(Unknown Sender)';
    const snippet = msg.data.snippet;
    const threadId = msg.data.threadId;

    return {
      id: message.id,
      from,
      subject,
      snippet,
      threadId,
    };
  });

  const emailData = await Promise.all(emailPromises);
  return emailData;
}
