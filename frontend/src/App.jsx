import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Compiler from './pages/Compiler.jsx';
import TypeSpeed from './pages/TypeSpeed.jsx';
import NotFound from './pages/NotFound.jsx';
import AppLayout from './layouts/AppLayout.jsx';

const App = () => {
  return (
    <Router>
      <AppLayout>
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compiler" element={<Compiler />} />
            <Route path="/typespeed" element={<TypeSpeed />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AppLayout>
    </Router>
  );
};

export default App;
