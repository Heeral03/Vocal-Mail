import React, { useState } from 'react';
import './ContactPage.css';
import devanshImg from '../assets/Devansh.jpeg';
import heeralImg from '../assets/Heeral.jpeg';

const ContactPage = () => {
  const [activeCard, setActiveCard] = useState(null);

  const teamMembers = [
    {
      name: 'Heeral Mandolia',
      role: 'Co-Founder · VocalMail',
      img: heeralImg,
      linkedin: 'https://linkedin.com/in/heeralmandolia',
      email: 'mailto:heeral@email.com',
    },
    {
      name: 'Devansh Pareek',
      role: 'Co-Founder · VocalMail',
      img: devanshImg,
      linkedin: 'https://linkedin.com/in/devanshpareek',
      email: 'mailto:devansh@email.com',
    },
  ];

  return (
    <section id="contact" className="contact-section">
      <div className="floating-bubbles"></div>

      <h2 className="contact-title">Let’s Connect</h2>
      <p className="contact-subtitle">
        Reach out to the minds behind VocalMail. We’re happy to collaborate, connect, or just chat!
      </p>

      <div className="contact-cards-wrapper">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className={`contact-card glass-card ${activeCard === index ? 'active' : ''}`}
            onMouseEnter={() => setActiveCard(index)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <img src={member.img} alt={member.name} className="contact-img" />
            <h3 className="contact-name">{member.name}</h3>
            <p className="contact-role">{member.role}</p>
            <div className="contact-links">
              <a href={member.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              <a href={member.email}>Email</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContactPage;
