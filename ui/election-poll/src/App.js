import React, { useState } from 'react';
import VotingInterface from './components/VotingInterface';
import AnalyticsDashboard from './components/AnalyticsDashboard';

function App() {
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {showAnalytics ? 'Back to Voting' : 'View Results'}
        </button>
      </div>
      {showAnalytics ? <AnalyticsDashboard /> : <VotingInterface />}
    </div>
  );
}

export default App;