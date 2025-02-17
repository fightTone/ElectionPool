import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './components/ThemeToggle';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import VotingInterface from './components/VotingInterface';
import { useTheme } from './contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

// Separate NavigationBar into a component that will be used inside Router
function NavigationBar() {
  const location = useLocation();
  const { isDark, setIsDark } = useTheme();
  
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 backdrop-blur-none bg-background border-b border-border shadow-sm z-50"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">2025 Election Poll</h1>
          
          {/* Center Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
              <Link 
                to="/"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                Vote
              </Link>
              <Link 
                to="/analytics"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/analytics' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                Results
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// Separate AnimatedRoutes component to use useLocation
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto pt-20 px-4"
      >
        <Routes>
          <Route path="/" element={<VotingInterface />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

// Main App component with proper Router structure
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <NavigationBar />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
