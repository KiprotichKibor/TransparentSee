import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { getStats } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DataVisualization = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getStats();
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch statistics');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading statistics...</div>;
  if (error) return <div className='alert alert-danger'>{error}</div>;
  if (!stats) return null;

  return (
    <div className='data-visualization'>
      <h3>Statistics Dashboard</h3>
      <div className='row'>
        <div className='col-md-6 mb-4'>
          <h4>Reports by Status</h4>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={stats.reportsByStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {stats.reportsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className='col-md-6 mb-4'>
          <h4>Top 5 Regions by Report Count</h4>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={stats.reportsByRegion.slice(0, 5)}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='region' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey='count' fill='#82ca9d' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className='row'>
        <div className='col-md-6 mb-4'>
          <h4>Investigations by Status</h4>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={stats.investigationsByStatus} layout="vertical">
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis type="number" />
              <YAxis dataKey='status' type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey='count' fill='#ffc658' />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className='col-md-6 mb-4'>
          <h4>Reports Submitted Over Time</h4>
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart data={stats.reportsOverTime}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey='count' stroke='#8884d8' fill='#8884d8' />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className='row'>
        <div className='col-md-12 mb-4'>
          <h4>User Activity Over Time</h4>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={stats.userActivityOverTime}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey='newUsers' stroke='#8884d8' name='New Users' />
              <Line type="monotone" dataKey='activeUsers' stroke='#82ca9d' name='Active Users' />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;