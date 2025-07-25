import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import EmailLogin from './pages/EmailLogin';
import ContactPage from './pages/ContactPage';
import EmailList from './components/EmailList';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/email-login" element={<EmailLogin />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* ✅ No nesting */}
        <Route path="/inbox" element={<EmailList />} />      {/* ✅ Inbox is its own page */}
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Router>
  );
}

export default App;
