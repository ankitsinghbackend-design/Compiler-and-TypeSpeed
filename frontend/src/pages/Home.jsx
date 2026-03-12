import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Keyboard } from 'lucide-react';

const AdPlaceholder = ({ width = 'w-full', height = 'h-full', label = 'Advertisement' }) => (
  <div className={`${width} ${height} flex flex-col items-center justify-center bg-gray-800/60 border border-dashed border-gray-600 rounded-xl`}>
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">AD</span>
    <span className="text-[9px] text-gray-600 tracking-wide">{label}</span>
  </div>
);

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#0d0d0d] font-sans">

      {/* Top Banner Ad */}
      <div className="w-full px-4 pt-4 pb-2">
        <AdPlaceholder height="h-16" label="728×90 Leaderboard" />
      </div>

      {/* Main 3-column layout: Left Rail | Content | Right Rail */}
      <div className="flex flex-1 w-full">

        {/* Left Skyscraper Ad Rail */}
        <div className="hidden lg:flex flex-col w-40 p-3 gap-4 shrink-0">
          <AdPlaceholder height="h-[600px]" label="160×600 Skyscraper" />
        </div>

        {/* Centre Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6 text-center tracking-tight">
            Developer Workspace
          </h1>
          <p className="text-gray-400 text-lg md:text-xl text-center mb-12 max-w-2xl leading-relaxed">
            Choose between building and testing dynamic codebase execution, or honing your raw keyboard speed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
            {/* Online Compiler Card */}
            <div
              onClick={() => navigate('/compiler')}
              className="group relative flex flex-col items-center p-8 bg-[#1e1e1e] border border-gray-700 rounded-2xl cursor-pointer hover:border-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="bg-blue-500/10 p-5 rounded-full mb-6 group-hover:bg-blue-500/20 transition-colors">
                <Code2 size={48} className="text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Online Compiler</h2>
              <p className="text-gray-400 text-center text-sm leading-relaxed">
                Standard lightning-fast compiler engine supporting 13 languages mapped seamlessly to cloud execution environments.
              </p>
            </div>

            {/* TypeSpeed Card */}
            <div
              onClick={() => navigate('/typespeed')}
              className="group relative flex flex-col items-center p-8 bg-[#1e1e1e] border border-gray-700 rounded-2xl cursor-pointer hover:border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="bg-purple-500/10 p-5 rounded-full mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Keyboard size={48} className="text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">TypeSpeed Tracker</h2>
              <p className="text-gray-400 text-center text-sm leading-relaxed">
                Enhance your typing velocity using real-time baseline tracking. Built seamlessly on the native Typer tracker core.
              </p>
            </div>
          </div>

          {/* Middle Rectangle Ad */}
          <div className="w-full max-w-3xl mt-10">
            <AdPlaceholder height="h-28" label="300×250 Medium Rectangle" />
          </div>
        </div>

        {/* Right Skyscraper Ad Rail */}
        <div className="hidden lg:flex flex-col w-40 p-3 gap-4 shrink-0">
          <AdPlaceholder height="h-[600px]" label="160×600 Skyscraper" />
        </div>
      </div>

      {/* Bottom Banner Ad */}
      <div className="w-full px-4 pb-4 pt-2">
        <AdPlaceholder height="h-16" label="728×90 Leaderboard" />
      </div>
    </div>
  );
};

export default Home;
