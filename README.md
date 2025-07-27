#  Vocal-Mail

**Vocal-Mail** is a productivity-first desktop application that helps you manage your emails while you focus on what truly matters.

It automatically **categorizes and prioritizes** your emails, **summarizes** the important ones using the **OpenRouter API**, and then uses **Murf TTS** to **read them out loud** — making multitasking smoother and smarter.

---

##  Features

-  Fetches your Gmail inbox using **Google Cloud OAuth integration**
-  Categorizes and separates priority and non-priority emails
-  Identifies important emails intelligently
-  Generates concise summaries using **OpenRouter's AI**
-  Reads out the summaries using **Murf Text-to-Speech**
- 🖥 Fully functional **desktop app** built with **React + Electron**

---

##  Tech Stack

- **Frontend**: React, CSS, React Icons
- **Backend**: Node.js with `.mjs` (ECMAScript Modules), Express
- **Desktop Wrapper**: Electron
- **APIs Used**:
  - [OpenRouter](https://openrouter.ai) – for email summarization
  - [Murf](https://murf.ai) – for text-to-speech conversion

---

##  Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/vocal-mail.git
cd vocal-mail

```
### 2. Install dependencies
```bash
npm install


```
### 3. Add your API keys
Create a .env file in the root directory and add your keys:
```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
MURF_API_KEY=your_murf_api_key_here
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost
PORT=
```
### 4. Run the app in development mode
```bash
npm start
```

### 5. Run the backend
```bash
node electron/api.mjs
```
### Future Enhancements
- User settings for voice, speed, and language

- Voice commands by user to play and stop reading emails

- Voice command murf to send replies as well

- Daily digest voice summary feature

### Acknowledgements
- OpenRouter for smart email summaries

- Murf for high-quality voice synthesis

- Google Cloud for Gmail API & OAuth



