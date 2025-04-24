import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart2, Users, MapPin } from 'lucide-react';
import { BARANGAYS } from '../constants/barangays';
import { ThemeToggle } from './ThemeToggle';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const COLORS = ['#22c55e', '#15803d', '#166534', '#14532d', '#047857', '#059669', '#10b981', '#34d399'];

const AnalyticsDashboard = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('MAYOR');
  const [selectedBarangay, setSelectedBarangay] = useState('All');
  const [barangayStats, setBarangayStats] = useState([]);

  // Add function to calculate pie chart size based on screen width
  const getPieChartSize = () => {
    if (typeof window === 'undefined') return 140;
    const width = window.innerWidth;
    if (width < 480) return 100;  // Mobile
    if (width < 768) return 120;  // Tablet
    return 140;  // Desktop
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = selectedBarangay === 'All' 
          ? `${API_BASE_URL}/results/live`
          : `${API_BASE_URL}/results/barangay/${selectedBarangay}`;
        
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
    
    const candidateEntries = Object.entries(results.results[position].candidates);
    const filteredEntries = candidateEntries
      .filter(([_, data]) => data.votes > 0)
      .map(([name, data]) => ({
        name: name.split('.')[1]?.trim() || name,
        votes: data.votes,
        percentage: data.percentage
      }))
      .sort((a, b) => b.votes - a.votes);

    // Find the maximum votes to calculate color intensity
    const maxVotes = Math.max(...filteredEntries.map(entry => entry.votes));

    // Create a gradient from dark blue to light green based on vote percentage
    return filteredEntries.map(entry => ({
      ...entry,
      fill: `hsl(${200 + ((entry.votes / maxVotes) * (142 - 200))}, ${
        70 + ((1 - entry.votes / maxVotes) * 20)
      }%, ${
        35 + ((1 - entry.votes / maxVotes) * 25)
      }%)`
      // This creates:
      // Highest votes: hsl(200, 70%, 35%) - Dark Blue
      // Lowest votes: hsl(142, 90%, 60%) - Light Green
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6"
      >
        <div className="space-y-3 sm:space-y-4">
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
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
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
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
            </motion.div>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {/* Barangay Filter */}
            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  Select Barangay
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
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

            {/* Position Selector */}
            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-base">Select Position</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border bg-background text-foreground"
                >
                  {results && Object.keys(results.results).map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Results Chart */}
            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  {selectedPosition} Results
                  <span className="text-xs text-muted-foreground font-normal">
                    (Scroll horizontally to see more →)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="relative w-full">
                  <div className="w-full overflow-x-auto">
                    <div className="h-[300px] sm:h-[400px]" style={{ minWidth: '600px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={prepareChartData(selectedPosition)}
                          margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis 
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            interval={0}
                            stroke="currentColor"
                            fontSize={12}
                            tickMargin={8}
                          />
                          <YAxis stroke="currentColor" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '0.5rem',
                              color: 'hsl(var(--foreground))',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                              padding: '8px 12px',
                              fontSize: '0.875rem'
                            }}
                            formatter={(value, name, props) => [
                              `${value} votes (${props.payload.percentage.toFixed(1)}%)`,
                              props.payload.name
                            ]}
                            labelStyle={{
                              color: 'hsl(var(--foreground))',
                              fontWeight: 'bold',
                              marginBottom: '4px'
                            }}
                            itemStyle={{
                              color: 'hsl(var(--foreground))',
                              padding: '2px 0'
                            }}
                            cursor={{ fill: 'hsl(var(--muted))' }}
                          />
                          <Bar 
                            dataKey="votes" 
                            radius={[4, 4, 0, 0]}
                          >
                            {prepareChartData(selectedPosition).map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.fill}
                                stroke="hsl(var(--background))"
                                strokeWidth={1}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {/* Add shadow and arrow indicators for scroll */}
                  <div className="absolute top-0 right-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-background via-background/50 to-transparent" />
                  <div className="absolute top-0 right-8 bottom-0 flex items-center pointer-events-none opacity-50">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5,
                        repeatType: "reverse" 
                      }}
                      className="text-muted-foreground"
                    >
                      →
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results Table */}
            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  Detailed Results {selectedBarangay !== 'All' ? `- ${selectedBarangay}` : ''}
                  <span className="text-xs text-muted-foreground font-normal">
                    (Scroll horizontally to see more →)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="relative w-full">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="sticky left-0 bg-background text-left py-2 px-3 text-xs sm:text-sm font-medium text-muted-foreground min-w-[200px] z-20 after:absolute after:top-0 after:right-0 after:bottom-0 after:w-4 after:shadow-[4px_0_6px_-1px_rgba(0,0,0,0.15)] after:pointer-events-none dark:after:shadow-[4px_0_6px_-1px_rgba(0,0,0,0.4)]">
                            Candidate
                          </th>
                          <th className="text-right py-2 px-3 text-xs sm:text-sm font-medium text-muted-foreground min-w-[100px]">
                            Votes
                          </th>
                          <th className="text-right py-2 px-3 text-xs sm:text-sm font-medium text-muted-foreground min-w-[100px]">
                            Percentage
                          </th>
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
                                <td className="sticky left-0 bg-background py-2 px-3 text-xs sm:text-sm z-10 after:absolute after:top-0 after:right-0 after:bottom-0 after:w-4 after:shadow-[4px_0_6px_-1px_rgba(0,0,0,0.15)] after:pointer-events-none dark:after:shadow-[4px_0_6px_-1px_rgba(0,0,0,0.4)]">
                                  {candidate}
                                </td>
                                <td className="text-right py-2 px-3 text-xs sm:text-sm">
                                  {data.votes}
                                </td>
                                <td className="text-right py-2 px-3 text-xs sm:text-sm text-muted-foreground">
                                  {data.percentage.toFixed(1)}%
                                </td>
                              </tr>
                            ))
                        }
                      </tbody>
                    </table>
                  </div>
                  {/* Enhanced shadow indicators for scroll */}
                  <div className="absolute top-0 right-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-background via-background/50 to-transparent" />
                  <div className="absolute top-0 right-8 bottom-0 flex items-center pointer-events-none opacity-50">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5,
                        repeatType: "reverse" 
                      }}
                      className="text-muted-foreground"
                    >
                      →
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart Card - Moved to bottom */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Vote Distribution by Barangay</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="h-[300px] sm:h-[350px] md:h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={barangayStats}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={getPieChartSize()}
                        label={({ name, percent }) => {
                          const label = `${name} (${(percent * 100).toFixed(1)}%)`;
                          return window.innerWidth < 480 ? name : label;
                        }}
                        labelLine={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1 }}
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
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          padding: '8px 12px'
                        }}
                        itemStyle={{
                          color: 'hsl(var(--foreground))',
                          fontSize: '14px',
                          padding: '2px 0'
                        }}
                        formatter={(value, name, entry) => [
                          `${name}\n${value} votes (${entry.payload.percentage.toFixed(1)}%)`,
                          ''
                        ]}
                        labelStyle={{
                          color: 'hsl(var(--foreground))',
                          fontWeight: 'bold',
                          marginBottom: '4px'
                        }}
                        wrapperStyle={{
                          zIndex: 20,
                          outline: 'none'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;