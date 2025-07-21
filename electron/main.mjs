import { app, BrowserWindow } from 'electron';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import { authorizeGmail } from './oauth.mjs';
import { google } from 'googleapis';
import { fetchEmails } from './fetchEmails.mjs';
import { ipcMain } from 'electron';

ipcMain.handle('get-emails', async () => {
  const emails = await fetchEmails();
  return emails;
});

// __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 📧 Gmail: Fetch emails
async function listEmails(auth) {
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    });

    const messages = res.data.messages || [];
    const emailData = [];

    for (const message of messages) {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });

      const headers = msg.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
      const from = headers.find(h => h.name === 'From')?.value || '(Unknown Sender)';
      const snippet = msg.data.snippet || '';

      emailData.push({ from, subject, snippet });
    }

    return emailData;
  } catch (err) {
    console.error('❌ Error fetching emails:', err);
    return [];
  }
}

// 🪟 Create main window
async function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const appURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../vocalmail-client/build/index.html')}`;

  await win.loadURL(appURL);
  if (isDev) win.webContents.openDevTools();

  // Gmail Auth + IPC
  try {
    const auth = await authorizeGmail();
    console.log('✅ Gmail authenticated');

    ipcMain.handle('get-emails', async () => {
      const emails = await listEmails(auth);
      return emails;
    });
  } catch (err) {
    console.error('❌ Gmail auth failed:', err.message);
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});