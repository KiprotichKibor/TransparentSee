import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getStats } from '../services/api';

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
            <h3>Statistics</h3>
            <div className='row'>
                <div className='col-md-6'>
                    <ResponsiveContainer width='100%' height={300}>
                        <BarChart data={stats.reportsByStatus}>
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis dataKey='status' />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey='count' fill='#8884d8' />
                        </BarChart>
                    </ResponsiveContainer>
                    <p className='text-center'>Reports by Status</p>
                </div>
                <div className='col-md-6'>
                    <ResponsiveContainer width='100%' height={300}>
                        <BarChart data={stats.reportsByRegion}>
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis dataKey='region' />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey='count' fill='#82ca9d' />
                        </BarChart>
                    </ResponsiveContainer>
                    <p className='text-center'>Reports by Region</p>
                </div>
            </div>
            <div className='row mt-4'>
                <div className='col-md-6'>
                    <ResponsiveContainer width='100%' height={300}>
                        <BarChart data={stats.investigationsByStatus}>
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis dataKey='status' />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey='count' fill='#ffc658' />
                        </BarChart>
                    </ResponsiveContainer>
                    <p className='text-center'>Investigations by Status</p>
                </div>
                <div className='col-md-6'>
                    <ResponsiveContainer width='100%' height={300}>
                        <BarChart data={stats.reportsOverTime}>
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis dataKey='date' />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey='count' fill='#ff7300' />
                        </BarChart>
                    </ResponsiveContainer>
                    <p className='text-center'>Reports Submitted Over Time</p>
                </div>
            </div>
        </div>
    );
};

export default DataVisualization;