import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart2, Users, MapPin } from 'lucide-react';
import { BARANGAYS } from '../constants/barangays';
import { ThemeToggle } from './ThemeToggle';

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
        const url = selectedBarangay === 'All' 
          ? 'http://3.84.6.19:8080/api/results/live'
          : `http://3.84.6.19:8080/api/results/barangay/${selectedBarangay}`;
        
        const response = await fetch(url);
        const data = await response.json();
        setResults(data);
        
        // Calculate barangay distribution only for overall results
        if (selectedBarangay === 'All') {
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
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load results');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [selectedBarangay]); // Add selectedBarangay as dependency

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl pt-8">
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
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
    
    // Get candidates data
    const candidateEntries = Object.entries(results.results[position].candidates);
    
    // Map the data and filter out candidates with zero votes
    return candidateEntries
      .filter(([_, data]) => data.votes > 0) // Only include candidates with votes
      .map(([name, data]) => ({
        name: name.split('.')[1]?.trim() || name,
        votes: data.votes,
        percentage: data.percentage
      }))
      .sort((a, b) => b.votes - a.votes);
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Votes Cast</p>
                <h3 className="text-2xl font-bold">{results?.total_votes || 0}</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-primary/10 rounded-full">
                <BarChart2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <h3 className="text-lg font-medium">
                  {new Date(results?.last_updated).toLocaleString()}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barangay Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Select Barangay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              className="w-full px-4 py-2 rounded-md border bg-background text-foreground"
            >
              <option value="All">All Barangays</option>
              {BARANGAYS.map((brgy) => (
                <option key={brgy} value={brgy}>{brgy}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Barangay Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vote Distribution by Barangay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={barangayStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={160}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    labelLine={{ stroke: 'hsl(var(--foreground))' }}
                  >
                    {barangayStats.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`hsl(${142 + (index * 20)} 70% 45%)`}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value, name, entry) => [
                      `${value} votes (${entry.payload.percentage.toFixed(1)}%)`,
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
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {results && Object.keys(results.results).map((position) => (
                <button
                  key={position}
                  onClick={() => setSelectedPosition(position)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPosition === position
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {position}
                </button>
              ))}
            </div>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    stroke="currentColor"
                    fontSize={12}
                    tickMargin={8}
                  />
                  <YAxis stroke="currentColor" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Bar 
                    dataKey="votes" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
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
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Candidate</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Votes</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {results?.results[selectedPosition]?.candidates && 
                    Object.entries(results.results[selectedPosition].candidates)
                      .filter(([_, data]) => data.votes > 0)
                      .sort((a, b) => b[1].votes - a[1].votes)
                      .map(([candidate, data]) => (
                        <tr 
                          key={candidate} 
                          className="border-b border-border transition-colors hover:bg-muted/50"
                        >
                          <td className="py-3 px-4">{candidate}</td>
                          <td className="text-right py-3 px-4">{data.votes}</td>
                          <td className="text-right py-3 px-4 text-muted-foreground">
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