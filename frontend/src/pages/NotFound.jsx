import { useNavigate } from 'react-router-dom';
import { TerminalSquare, Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] lg:min-h-screen text-center px-4">
      <div className="flex items-center justify-center w-24 h-24 bg-gray-800 rounded-full mb-8 border border-gray-700 shadow-lg shadow-red-900/20">
        <AlertCircle size={48} className="text-red-500" />
      </div>
      
      <h1 className="text-6xl md:text-8xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-4 tracking-tight">
        404
      </h1>
      
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-200 mb-4">
        Page Not Found
      </h2>
      
      <p className="text-gray-400 max-w-md mx-auto mb-10 leading-relaxed text-lg">
        The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-900/50 hover:-translate-y-0.5"
        >
          <Home size={18} />
          <span>Back to Home</span>
        </button>
        
        <button
          onClick={() => navigate('/compiler')}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-xl border border-gray-700 transition-all hover:-translate-y-0.5"
        >
          <TerminalSquare size={18} />
          <span>Open Compiler</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
