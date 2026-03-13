import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AdPlaceholder = ({ label = 'Advertisement' }) => (
  <div style={{
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(31,41,55,0.6)', border: '1px dashed #4b5563', borderRadius: '8px'
  }}>
    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: 2 }}>AD</span>
    <span style={{ fontSize: 9, color: '#4b5563', letterSpacing: '0.05em' }}>{label}</span>
  </div>
);

const TypeSpeed = () => {
    const navigate = useNavigate();

    return (
        <div className="ts-page">
            <style>{`
                .ts-page {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    background: #121212;
                    font-family: system-ui, -apple-system, sans-serif;
                }

                .ts-header {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid #1f2937;
                    background: #1e1e1e;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    z-index: 20;
                }

                .ts-back-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #9ca3af;
                    background: none;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    transition: all 200ms;
                }
                .ts-back-btn:hover { color: white; background: #374151; }

                .ts-header-ad {
                    width: 468px;
                    height: 60px;
                }

                .ts-main {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }

                .ts-side-ad {
                    display: flex;
                    width: 144px;
                    padding: 8px;
                }

                .ts-iframe-wrap {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                }

                .ts-iframe-wrap iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                    position: absolute;
                    top: 0;
                    left: 0;
                    background: #f5f0e8;
                }

                .ts-bottom-ad {
                    width: 100%;
                    height: 80px;
                    padding: 8px 16px;
                    background: #1a1a1a;
                    border-top: 1px solid #1f2937;
                }

                /* ==================== MOBILE / ANDROID RESPONSIVE ==================== */
                @media (max-width: 768px) {
                    .ts-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 10px 12px;
                    }

                    .ts-header-ad {
                        display: none;
                    }

                    .ts-header-spacer {
                        display: none;
                    }

                    .ts-side-ad {
                        display: none;
                    }

                    .ts-bottom-ad {
                        height: 60px;
                        padding: 6px 10px;
                    }

                    .ts-back-btn span {
                        display: none;
                    }

                    .ts-mobile-ad {
                        display: flex;
                        justify-content: center;
                        padding: 6px 0;
                    }
                }

                @media (max-width: 480px) {
                    .ts-header {
                        padding: 8px 10px;
                    }

                    .ts-bottom-ad {
                        height: 50px;
                        padding: 4px 8px;
                    }
                }

                /* Mobile ad slots — hidden on desktop */
                .ts-mobile-ad {
                    display: none;
                }
            `}</style>

            {/* Header / Navbar */}
            <div className="ts-header">
                {/* Left — Back button */}
                <div>
                    <button onClick={() => navigate('/')} className="ts-back-btn">
                        <ArrowLeft size={18} />
                        <span>BACK TO MENU</span>
                    </button>
                </div>

                {/* Centre — Horizontal Ad (hidden on mobile) */}
                <div className="ts-header-ad">
                    <AdPlaceholder label="468×60 Banner" />
                </div>

                {/* Right — balancer (hidden on mobile) */}
                <div className="ts-header-spacer" />
            </div>

            {/* Mobile-only: top banner ad */}
            <div className="ts-mobile-ad">
                <AdPlaceholder label="320×50 Mobile Banner" />
            </div>

            {/* Main area */}
            <div className="ts-main">
                {/* Left Skyscraper (hidden on mobile) */}
                <div className="ts-side-ad">
                    <AdPlaceholder label="160×600 Skyscraper" />
                </div>

                {/* Typer iframe */}
                <div className="ts-iframe-wrap">
                    <iframe
                        src="/typer/index.html"
                        title="TypeSpeed Tracker"
                    />
                </div>

                {/* Right Skyscraper (hidden on mobile) */}
                <div className="ts-side-ad">
                    <AdPlaceholder label="160×600 Skyscraper" />
                </div>
            </div>

            {/* Bottom Banner Ad — desktop */}
            <div className="ts-bottom-ad">
                <AdPlaceholder label="728×90 Leaderboard" />
            </div>

            {/* Bottom — mobile-only smaller banner */}
            <div className="ts-mobile-ad">
                <AdPlaceholder label="320×50 Mobile Banner" />
            </div>
        </div>
    );
};

export default TypeSpeed;
