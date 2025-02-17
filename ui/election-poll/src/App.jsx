import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './components/ThemeToggle';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import VotingInterface from './components/VotingInterface';
import { useTheme } from './contexts/ThemeContext'; // Add this import

function NavigationBar() {
  const location = useLocation();
  const { isDark, setIsDark } = useTheme();
  
  return (
    <nav className="fixed top-0 left-0 right-0 backdrop-blur-none bg-background border-b border-border shadow-sm">
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
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <NavigationBar />
        <main className="container mx-auto pt-20 px-4">
          <Routes>
            <Route path="/" element={<VotingInterface />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
