import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BottomNav } from './components/layout/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Vendors } from './pages/Vendors';
import { Budget } from './pages/Budget';
import { BridalParty } from './pages/BridalParty';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col max-w-md mx-auto relative bg-cream shadow-xl">
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/party" element={<BridalParty />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
