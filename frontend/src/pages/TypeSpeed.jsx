import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AdPlaceholder = ({ width = 'w-full', height = 'h-full', label = 'Advertisement' }) => (
  <div className={`${width} ${height} flex flex-col items-center justify-center bg-gray-800/60 border border-dashed border-gray-600 rounded-lg`}>
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">AD</span>
    <span className="text-[9px] text-gray-600 tracking-wide">{label}</span>
  </div>
);

const TypeSpeed = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-screen bg-[#121212] font-sans">
            {/* Header / Navbar */}
            <div className="grid grid-cols-3 items-center p-4 border-b border-gray-800 bg-[#1e1e1e] shadow-md z-10">
                {/* Left — Back button */}
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-gray-800"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm font-semibold tracking-wide">BACK TO MENU</span>
                    </button>
                </div>

                {/* Centre — Horizontal Ad */}
                <div className="flex justify-center">
                    <div className="w-[468px] h-16">
                        <AdPlaceholder label="468×60 Banner" />
                    </div>
                </div>

                {/* Right — intentionally empty, balances the grid */}
                <div />
            </div>

            {/* Main area: left ad rail + typer + right ad rail */}
            <div className="flex flex-1 overflow-hidden">

                {/* Left Skyscraper Ad */}
                <div className="hidden lg:flex w-36 p-2">
                    <AdPlaceholder width="w-full" height="h-full" label="160×600 Skyscraper" />
                </div>

                {/* Typer iframe */}
                <div className="flex-1 relative overflow-hidden">
                    <iframe
                        src="/typer/index.html"
                        title="TypeSpeed Tracker"
                        className="w-full h-full border-0 absolute top-0 left-0"
                        style={{ backgroundColor: '#f5f0e8' }}
                    />
                </div>

                {/* Right Skyscraper Ad */}
                <div className="hidden lg:flex w-36 p-2">
                    <AdPlaceholder width="w-full" height="h-full" label="160×600 Skyscraper" />
                </div>
            </div>

            {/* Bottom Banner Ad */}
            <div className="w-full h-24 px-4 py-2 bg-[#1a1a1a] border-t border-gray-800">
                <AdPlaceholder height="h-full" label="728×90 Leaderboard" />
            </div>
        </div>
    );
};

export default TypeSpeed;
