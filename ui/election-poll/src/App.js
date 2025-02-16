import React, { useState } from 'react';
import VotingInterface from './components/VotingInterface';
import AnalyticsDashboard from './components/AnalyticsDashboard';

function App() {
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 pt-4">
        <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg max-w-xs mx-auto mb-4 sm:mb-6">
          <button
            onClick={() => setShowAnalytics(false)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              !showAnalytics 
                ? 'bg-green-600 text-white shadow-sm' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            Vote
          </button>
          <button
            onClick={() => setShowAnalytics(true)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              showAnalytics 
                ? 'bg-green-600 text-white shadow-sm' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            Results
          </button>
        </div>
      </div>
      {showAnalytics ? <AnalyticsDashboard /> : <VotingInterface />}
    </div>
  );
}

export default App;