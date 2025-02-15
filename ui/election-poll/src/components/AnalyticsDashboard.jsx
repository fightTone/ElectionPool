import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, Users } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('MAYOR');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8080/api/results/live');
        const data = await response.json();
        setResults(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load results');
        setLoading(false);
      }
    };

    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md p-6">
          <CardContent>
            <div className="text-center">Loading results...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md p-6">
          <CardContent>
            <div className="text-center text-red-600">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const prepareChartData = (position) => {
    if (!results?.results[position]?.candidates) return [];
    
    return Object.entries(results.results[position].candidates).map(([name, data]) => ({
      name: name.split('.')[1].trim(), // Remove the number prefix
      votes: data.votes,
      percentage: data.percentage
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Votes Cast</p>
                  <h3 className="text-2xl font-bold">{results?.total_votes || 0}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <BarChart2 className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <h3 className="text-lg font-medium">
                    {new Date(results?.last_updated).toLocaleString()}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Position Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Position</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {results && Object.keys(results.results).map((position) => (
              <button
                key={position}
                onClick={() => setSelectedPosition(position)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedPosition === position
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {position}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Results Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedPosition} Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareChartData(selectedPosition)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'percentage' ? `${value.toFixed(1)}%` : value,
                      name === 'percentage' ? 'Percentage' : 'Votes'
                    ]}
                  />
                  <Bar dataKey="votes" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Candidate</th>
                    <th className="text-right py-3 px-4">Votes</th>
                    <th className="text-right py-3 px-4">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {results?.results[selectedPosition]?.candidates && 
                    Object.entries(results.results[selectedPosition].candidates)
                      .sort((a, b) => b[1].votes - a[1].votes)
                      .map(([candidate, data]) => (
                        <tr key={candidate} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{candidate}</td>
                          <td className="text-right py-3 px-4">{data.votes}</td>
                          <td className="text-right py-3 px-4">
                            {data.percentage.toFixed(1)}%
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;