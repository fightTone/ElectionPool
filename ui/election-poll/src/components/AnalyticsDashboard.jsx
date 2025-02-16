import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart2, Users, MapPin } from 'lucide-react';
import { BARANGAYS } from '../constants/barangays';

const COLORS = ['#22c55e', '#15803d', '#166534', '#14532d', '#047857', '#059669', '#10b981', '#34d399'];

const AnalyticsDashboard = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('MAYOR');
  const [selectedBarangay, setSelectedBarangay] = useState('All');
  const [barangayStats, setBarangayStats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://3.84.6.19:8080/api/results/live');
        const data = await response.json();
        setResults(data);
        
        // Calculate barangay distribution
        const barangayCounts = {};
        data.votes?.forEach(vote => {
          barangayCounts[vote.barangay] = (barangayCounts[vote.barangay] || 0) + 1;
        });
        
        const barangayData = Object.entries(barangayCounts).map(([name, value]) => ({
          name,
          value,
          percentage: (value / data.total_votes) * 100
        }));
        
        setBarangayStats(barangayData);
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
      <div className="flex justify-center items-center min-h-screen bg-background">
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
      <div className="flex justify-center items-center min-h-screen bg-background">
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
    
    let candidateData = Object.entries(results.results[position].candidates).map(([name, data]) => ({
      name: name.split('.')[1].trim(), // Remove the number prefix
      votes: data.votes,
      percentage: data.percentage
    }));

    // Filter by barangay if selected
    if (selectedBarangay !== 'All') {
      candidateData = candidateData.map(candidate => ({
        ...candidate,
        votes: candidate.votes_by_barangay?.[selectedBarangay] || 0,
        percentage: candidate.percentage_by_barangay?.[selectedBarangay] || 0
      }));
    }

    return candidateData;
  };

  return (
    <div className="min-h-screen py-4 sm:py-8 px-2 sm:px-4">
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Users className="w-8 h-8 text-green-500" />
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

        {/* Barangay Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Barangay Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              className="w-full p-2 rounded-md border border-gray-800 bg-gray-900/50 text-gray-100 outline-none"
            >
              <option value="All">All Barangays</option>
              {BARANGAYS.map((brgy) => (
                <option key={brgy} value={brgy} className="bg-gray-900">
                  {brgy}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Barangay Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Votes by Barangay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={barangayStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({name, percentage}) => `${name} (${percentage.toFixed(1)}%)`}
                  >
                    {barangayStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.375rem'
                    }}
                    formatter={(value, name, props) => [
                      `${value} votes (${props.payload.percentage.toFixed(1)}%)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Position Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Position</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1 sm:gap-2">
            {results && Object.keys(results.results).map((position) => (
              <button
                key={position}
                onClick={() => setSelectedPosition(position)}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm ${
                  selectedPosition === position
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
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
            <div className="h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareChartData(selectedPosition)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" /> {/* Darker grid lines */}
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    stroke="#fff"  // Make axis labels white
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis stroke="#fff" /> {/* Make axis labels white */}
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '0.375rem'
                    }}
                    labelStyle={{ color: '#e5e7eb' }}
                    itemStyle={{ color: '#22c55e' }}
                    formatter={(value, name) => [
                      name === 'percentage' ? `${value.toFixed(1)}%` : value,
                      name === 'percentage' ? 'Percentage' : 'Votes'
                    ]}
                  />
                  <Bar dataKey="votes" fill="#22c55e" /> {/* Changed to green-500 */}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Detailed Results {selectedBarangay !== 'All' ? `- ${selectedBarangay}` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Candidate</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4">Votes</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {results?.results[selectedPosition]?.candidates && 
                    Object.entries(results.results[selectedPosition].candidates)
                      .sort((a, b) => b[1].votes - a[1].votes)
                      .map(([candidate, data]) => (
                        <tr key={candidate} className="border-b border-gray-800 hover:bg-gray-800/50">
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