import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Keyboard } from 'lucide-react';

/* 
  Ad slot wrapper — each slot gets a unique id for future AdSense injection.
  Desktop and mobile slots are separate so AdSense can serve the right format.
  data-ad-slot can be replaced with your actual AdSense unit IDs later.
*/
const AdSlot = ({ id, className = '', style = {}, label = 'AD' }) => (
  <div
    id={id}
    className={className}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(31,41,55,0.6)', border: '1px dashed #4b5563', borderRadius: '10px',
      ...style
    }}
  >
    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: 2 }}>AD</span>
    <span style={{ fontSize: 9, color: '#4b5563', letterSpacing: '0.05em' }}>{label}</span>
  </div>
);

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <style>{`
        .home-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #0d0d0d;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* Desktop ad slots */
        .ad-top-desktop     { width: 100%; height: 90px; padding: 12px 16px; }
        .ad-sky-left,
        .ad-sky-right       { width: 160px; padding: 12px; flex-shrink: 0; }
        .ad-mid-desktop     { width: 100%; max-width: 768px; height: 112px; margin-top: 40px; }
        .ad-bottom-desktop  { width: 100%; height: 90px; padding: 12px 16px; }

        /* Mobile ad slots — hidden on desktop */
        .ad-mobile-banner   { display: none; }
        .ad-mobile-rect     { display: none; }

        .home-main {
          display: flex;
          flex: 1;
          width: 100%;
        }

        .home-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          width: 100%;
          max-width: 768px;
        }

        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px;
          background: #1e1e1e;
          border: 1px solid #374151;
          border-radius: 16px;
          cursor: pointer;
          transition: all 300ms;
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 0 30px rgba(59,130,246,0.15);
        }

        /* ==================== MOBILE ==================== */
        @media (max-width: 768px) {
          /* Hide desktop-specific ads */
          .ad-top-desktop    { height: 60px; padding: 8px 10px; }
          .ad-sky-left,
          .ad-sky-right      { display: none; }
          .ad-mid-desktop    { display: none; }
          .ad-bottom-desktop { height: 60px; padding: 8px 10px; }

          /* Show mobile ads */
          .ad-mobile-banner {
            display: flex;
            width: 100%;
            height: 50px;
            padding: 4px 16px;
          }
          .ad-mobile-rect {
            display: flex;
            width: 100%;
            max-width: 320px;
            height: 100px;
            margin: 16px auto;
          }

          .home-content { padding: 16px; }

          .cards-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .card { padding: 20px; }
        }

        @media (max-width: 480px) {
          .ad-mobile-banner { height: 50px; }
          .ad-mobile-rect   { height: 100px; }
        }
      `}</style>

      {/* ===== TOP: Desktop Leaderboard ===== */}
      <div className="ad-top-desktop">
        <AdSlot id="home-top-leaderboard" style={{ width: '100%', height: '100%' }} label="728×90 Leaderboard" />
      </div>

      {/* ===== TOP: Mobile Banner (shown only <768px) ===== */}
      <div className="ad-mobile-banner">
        <AdSlot id="home-top-mobile" style={{ width: '320px', height: '50px', margin: '0 auto' }} label="320×50 Mobile Banner" />
      </div>

      <div className="home-main">
        {/* Left Skyscraper — desktop only */}
        <div className="ad-sky-left">
          <AdSlot id="home-sky-left" style={{ width: '100%', height: '600px' }} label="160×600 Skyscraper" />
        </div>

        {/* Centre Content */}
        <div className="home-content">
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6 text-center tracking-tight">
            Developer Workspace
          </h1>
          <p className="text-gray-400 text-lg md:text-xl text-center mb-12 max-w-2xl leading-relaxed">
            Choose between building and testing dynamic codebase execution, or honing your raw keyboard speed.
          </p>

          <div className="cards-grid">
            {/* Compiler Card */}
            <div className="card" onClick={() => navigate('/compiler')}>
              <div className="bg-blue-500/10 p-5 rounded-full mb-6">
                <Code2 size={48} className="text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Online Compiler</h2>
              <p className="text-gray-400 text-center text-sm leading-relaxed">
                Lightning-fast compiler engine supporting 13 languages.
              </p>
            </div>

            {/* Mobile-only: inline ad between cards */}
            <div className="ad-mobile-rect" style={{ gridColumn: '1 / -1' }}>
              <AdSlot id="home-between-cards" style={{ width: '100%', height: '100%' }} label="320×100 Large Mobile Banner" />
            </div>

            {/* TypeSpeed Card */}
            <div className="card" onClick={() => navigate('/typespeed')}>
              <div className="bg-purple-500/10 p-5 rounded-full mb-6">
                <Keyboard size={48} className="text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">TypeSpeed Tracker</h2>
              <p className="text-gray-400 text-center text-sm leading-relaxed">
                Real-time typing velocity tracker built on Typer core.
              </p>
            </div>
          </div>

          {/* Desktop middle rectangle */}
          <div className="ad-mid-desktop">
            <AdSlot id="home-mid-rect" style={{ width: '100%', height: '100%' }} label="300×250 Medium Rectangle" />
          </div>
        </div>

        {/* Right Skyscraper — desktop only */}
        <div className="ad-sky-right">
          <AdSlot id="home-sky-right" style={{ width: '100%', height: '600px' }} label="160×600 Skyscraper" />
        </div>
      </div>

      {/* ===== BOTTOM: Desktop Leaderboard ===== */}
      <div className="ad-bottom-desktop">
        <AdSlot id="home-bottom-leaderboard" style={{ width: '100%', height: '100%' }} label="728×90 Leaderboard" />
      </div>

      {/* ===== BOTTOM: Mobile Banner (shown only <768px) ===== */}
      <div className="ad-mobile-banner">
        <AdSlot id="home-bottom-mobile" style={{ width: '320px', height: '50px', margin: '0 auto' }} label="320×50 Mobile Banner" />
      </div>
    </div>
  );
};

export default Home;
