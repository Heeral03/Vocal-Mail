// electron/fetchEmails.mjs
import { authorizeGmail, listEmails } from './oauth.mjs';

export async function fetchEmails() {
  try {
    const auth = await authorizeGmail();
    const emails = await listEmails(auth, 5); // You can adjust maxResults here
    return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    return []; // Return empty array on failure
  }
}
