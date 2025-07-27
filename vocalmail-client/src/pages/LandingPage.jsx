import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { Link } from 'react-router-dom';
import ReactFullpage from '@fullpage/react-fullpage';
import img1 from '../assets/img1.png';
import img2 from '../assets/img2.png';
const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [activeWave, setActiveWave] = useState(1);
  const sectionRefs = useRef([]);
  const [visibleSection, setVisibleSection] = useState(null);
const horizontalRef = useRef(null);
const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const waveInterval = setInterval(() => {
      setActiveWave(prev => (prev % 3) + 1);
    }, 2000);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(waveInterval);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSection(entry.target.dataset.index);
          }
        });
      },
      { threshold: 0.6 }
    );

    sectionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);
useEffect(() => {
  const container = document.querySelector(".horizontal-feature-scroll");

  const onWheel = (e) => {
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const isInSection =
      rect.top <= window.innerHeight && rect.bottom >= 0;

    if (isInSection) {
      e.preventDefault();
      container.scrollBy({
        left: e.deltaY * 1.5,
        behavior: "smooth",
      });
    }
  };

  window.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    window.removeEventListener("wheel", onWheel);
  };
}, []);
const steps = [
  {
    
    title: "Connect Your Email",
    description: "Securely link your email accounts in seconds"
  },
  {
   
    title: "AI Processes Your Inbox",
    description: "VocalMail reads and prioritizes new messages"
  },
  {
    
    title: "Listen ",
    description: "Hear emails aloud in Human-voice"
  }
];


  const features = [
    {
      title: "Smart Multitasking",
      description: "Handle other tasks while VocalMail manages your inbox - reply, organize, and prioritize with voice commands.",
        bgGradient: "linear-gradient(135deg,rgba(194, 175, 176, 0.85))" 
    },
    {
      title: "AI Email Reading",
      description: "Listen to your emails hands-free with natural, human-like voice narration powered by 'Murf.ai TTS'.",
      bgGradient: "linear-gradient(135deg,rgba(194, 175, 176, 0.85))"
    }
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container header-container">
          {/* Logo */}
          <div className="logo">
            <div className="logo-circle">
              <span className="logo-text">VM</span>
            </div>
            <span className="logo-name">VocalMail</span>
          </div>
           {/* Navigation */}
          <nav className="nav" aria-label="Main Navigation">
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              
              <li><Link to="/contact" className="cta-nav-button">Contact</Link></li>
              
            </ul>
          </nav>

          <button className="mobile-menu-button">☰</button>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-inner">
          {/* Left: Text Content */}
          <div className="hero-left">
            
            
            <h1 className="main-title">
              Let AI Handle Your Emails While You Focus on What Matters
            </h1>
            <p className="tagline">AI-Powered Email Voice Assistant using 'MURF'</p>
            <div className="cta-container">
             <button className="cta-button" onClick={() => navigate('/email-login')}>
  Get Started
</button>

              <a href="#features" className="secondary-button">Explore Features</a>
            </div>
            
            <div className="voice-command-demo">
              <div className="voice-icon"></div>
              <p className="command-text">"Read my latest email from Alex"</p>
            </div>
          </div>
          
          {/* Right: Enhanced Visual with Multiple Animations */}
          <div className="hero-right">
            <div className="hero-visual">
              {/* Enhanced Email Animation */}
              <div className="email-reading-animation">
                <div className="email-item priority-high">
                  <div className="email-sender">Dr. Raj </div>
                  <div className="email-subject">You have your lab end-term TOMORROW!!</div>
                </div>
                <div className="email-item priority-medium">
                  <div className="email-sender">Marketing Team</div>
                  <div className="email-subject">New Campaign Results</div>
                </div>
                <div className="email-item priority-low">
                  <div className="email-sender">Company Newsletter</div>
                  <div className="email-subject">Monthly Updates</div>
                </div>
              </div>
              
              {/* Enhanced Wave Animations */}
              <div className="voice-waves">
                <div className={`wave wave-${activeWave}`} id={`wave-${activeWave}`}></div>
              </div>
              
              {/* NEW: Voice Interaction Animation */}
              <div className="voice-interaction-animation">
                <div className="voice-bubble"></div>
                <div className="voice-pulse"></div>
              </div>
              
              {/* NEW: Priority Indicator Animation */}
              <div className="priority-indicators">
                <div className="priority-dot high"></div>
                <div className="priority-dot medium"></div>
                <div className="priority-dot low"></div>
              </div>
              
              {/* NEW: Processing Animation */}
              <div className="processing-animation">
                <div className="processing-circle"></div>
                <div className="processing-dots">
                  <div className="processing-dot" style={{ animationDelay: '0s' }}></div>
                  <div className="processing-dot" style={{ animationDelay: '0.3s' }}></div>
                  <div className="processing-dot" style={{ animationDelay: '0.6s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="about" class="about-section">
        <div class="container">
            <div class="about-card">
                <div class="about-left">
                    <h2 class="section-title fade-in">Meet <span>VocalMail</span></h2>
                    <p class="about-subtext fade-in-delay">
                        Your smart voice agent that reads emails out loud — so you can stay hands-free, focused, and in flow. 
                    </p>

                    <div class="murf-highlight slide-up">
                        <h3>🔊 Built with <span class="murf-brand">Murf.ai</span></h3>
                        <p>
                            Harnessing the power of <strong>Murf's expressive TTS API</strong>, VocalMail turns every email into a lifelike narration — with tone, clarity, and emotion that feels real.
                        </p>
                        <a 
                            href="https://murf.ai/api/docs/introduction/overview" 
                            class="murf-link" 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            Explore Murf Docs →
                        </a>
                    </div>

                    <p class="about-extra fade-in-delay">
                        VocalMail isn’t just smart — it’s personal. From summarizing inboxes to reading out full threads, it’s your on-the-go voice companion.
                    </p>
                </div>

                <div class="about-right">
                    <div class="voice-visualization">
                        <div class="voice-circle">
                            <i class="fas fa-microphone-alt microphone-icon"></i>
                        </div>
                        <div class="voice-waves">
                            <div class="wave wave-1"></div>
                            <div class="wave wave-2"></div>
                            <div class="wave wave-3"></div>
                        </div>
                        <div class="floating-emails">
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

<section id="features" className="features-section-wrapper">
  <div className="horizontal-feature-scroll" ref={horizontalRef}>
    {features.map((feature, index) => (
      <div
        className="feature-slide"
        key={index}
        style={{
          background: feature.bgGradient,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Image Layer */}
        {index === 0 && (
          <img
            src={img1}
            alt="Background"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) scale(1.1) rotate(-2deg)",
              width: "120%",
              height: "120%",
              objectFit: "cover",
              zIndex: 0,
              opacity: 0.09,
              mixBlendMode: "soft-light",
              pointerEvents: "none",
            }}
          />
        )}

        {index === 1 && (
          <img
            src={img2}
            alt="Background"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) scale(1.1) rotate(-2deg)",
              width: "120%",
              height: "120%",
              objectFit: "cover",
              zIndex: 0,
              opacity: 0.1,
              mixBlendMode: "soft-light",
              pointerEvents: "none",
            }}
          />
        )}

        <div className="feature-container" style={{ position: "relative", zIndex: 2 }}>
          <div className="feature-header">
            <div className="feature-eyebrow">
              {index === 0 ? "VOICE CONTROL" : "TEXT TO SPEECH"}
            </div>
            <h2 className="feature-main-title">{feature.title}</h2>
            <p className="feature-subtitle">{feature.description}</p>
          </div>

          <div className="feature-content">
            <div className="feature-visual">{/* Visual goes here */}</div>

            {/* Feature Text — now applied to both cards */}
            <div className="feature-text glass-feature-card">
              <h3 className="feature-title">
                {index === 0 ? "Effortless Voice Control" : "Human-Like Narration"}
              </h3>
              <p className="feature-description">
                {index === 0 ? (
                  <>
                    Focus on important tasks while VocalMail manages your inbox through voice commands.
                    <span className="feature-highlight"> prioritize urgent emails</span>, and
                    <span className="feature-highlight"> read your mails in human-like voice </span> using Murf.
                  </>
                ) : (
                  <>
                    VocalMail uses <span className="feature-highlight">Murf.ai's natural TTS engine</span> to bring your inbox to life.
                    Let your emails speak to you with clarity, tone, and emotion.
                  </>
                )}
              </p>
              <p className="feature-description">
                {index === 0 ? (
                  "Our advanced voice recognition understands natural speech patterns, making email management feel like a conversation with your personal assistant."
                ) : (
                  <>
                    Experience <span className="feature-highlight">hands-free email access</span>—ideal for multitaskers, people with reading difficulties, or anyone on the move.
                  </>
                )}
              </p>
             
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="feature-buttons">
            {index > 0 && (
              <button
                className="prev-button"
                onClick={() => {
                  if (horizontalRef.current) {
                    const scrollAmount = horizontalRef.current.clientWidth;
                    horizontalRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
                  }
                }}
              >
                ← Previous
              </button>
            )}
            {index < features.length - 1 && (
              <button
                className="next-button"
                onClick={() => {
                  if (horizontalRef.current) {
                    const scrollAmount = horizontalRef.current.clientWidth;
                    horizontalRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
                  }
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
</section>



 
      
<section id="how-it-works" className="how-it-works enhanced">
  <div className="container">
    <h2 className="section-title">How VocalMail Works</h2>

    <div className="steps-container">
      {steps.map((step, index) => (
        <div className="step-card glow-card" key={index} style={{ animationDelay: `${index * 0.2}s` }}>
          <div className="step-number">{index + 1}</div>
          <div className="step-icon">{step.icon}</div>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </div>
      ))}
    </div>

    
  </div>
</section>


      {/*Contact*/}
      
    
      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">Vocal Mail</div>
              <p>Your AI-powered email voice assistant</p>
            
            </div>
            
            <div className="footer-links">
              <div className="link-group">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#about">About</a>
                <a href="#how-it-works">How it works</a>
              </div>
              
              <div className="link-group">
                <h4>Connect</h4>
                
               
               <Link to="/contact">LinkedIn</Link>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="legal-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
            <p className="copyright">
              &copy; {new Date().getFullYear()} VocalMail. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;