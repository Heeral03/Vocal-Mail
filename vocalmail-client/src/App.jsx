import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import EmailLogin from './pages/EmailLogin';     // NEW: Make sure this file exists
import ContactPage from './pages/ContactPage';
import EmailList from './components/EmailList';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Email login page */}
        <Route path="/email-login" element={<EmailLogin />} />

        {/* Inbox page */}
        <Route
          path="/inbox"
          element={
            <div>
              <h1 style={{ textAlign: 'center', marginTop: '1rem' }}>VocalMail Inbox</h1>
              <EmailList />
            </div>
          }
        />

        {/* Contact page */}
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Router>
  );
}

export default App;
