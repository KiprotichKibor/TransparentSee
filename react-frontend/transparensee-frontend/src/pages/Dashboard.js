import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getRecentReports, getRecentInvestigations, getUserStats } from '../services/api';
import ReportCard from '../components/ReportCard';
import InvestigationCard from '../components/InvestigationCard';
import DataVisualization from '../components/DataVisualization';
import '../styles/pages/Dashboard.css';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [recentReports, setRecentReports] = useState([]);
    const [recentInvestigations, setRecentInvestigations] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [reportsResponse, investigationsResponse, statsResponse] = await Promise.all([
                    getRecentReports(5),
                    getRecentInvestigations(5),
                    user?.id ? getUserStats(user.id) : Promise.resolve(null)
                ]);
                console.log('Recent Reports:', reportsResponse.data);
                console.log('Recent Investigations:', investigationsResponse.data);
                console.log('User Stats:', statsResponse.data);
                
                setRecentReports(reportsResponse.data);
                setRecentInvestigations(investigationsResponse.data);
                if (statsResponse) setUserStats(statsResponse.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    if (loading) return <div className="d-flex justify-content-center"><div className="spinner-border" role="status"></div></div>;
    if (error) return <div className='alert alert-danger'>{error}</div>;

    return (
        <div className='container mt-5'>
            <div className='row mb-4'>
                <div className='col-md-8'>
                    <h2>Welcome, {user.username}!</h2>
                    <p>Your contributions are making a difference. Here's your impact so far:</p>
                </div>
                <div className='col-md-4 text-end'>
                    <Link to='/submit-report' className='btn btn-primary'>Submit New Report</Link>
                </div>
            </div>

            <div className='row mb-4'>
                <div className='col-md-3'>
                    <div className='card text-center'>
                        <div className='card-body'>
                            <h5 className='card-title'>{userStats?.totalReports || 0}</h5>
                            <p className='card-text'>Reports Submitted</p>
                        </div>
                    </div>
                </div>
                <div className='col-md-3'>
                    <div className='card text-center'>
                        <div className='card-body'>
                            <h5 className='card-title'>{userStats?.totalContributions || 0}</h5>
                            <p className='card-text'>Contributions Made</p>
                        </div>
                    </div>
                </div>
                <div className='col-md-3'>
                    <div className='card text-center'>
                        <div className='card-body'>
                            <h5 className='card-title'>{userStats?.reputationScore || 0}</h5>
                            <p className='card-text'>Reputation Score</p>
                        </div>
                    </div>
                </div>
                <div className='col-md-3'>
                    <div className='card text-center'>
                        <div className='card-body'>
                            <h5 className='card-title'>{userStats?.badgesEarned || 0}</h5>
                            <p className='card-text'>Badges Earned</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='row mb-4'>
                <div className='col-md-6'>
                    <h3>Your Recent Reports</h3>
                    {recentReports.length > 0 ? (
                        recentReports.map((report) => (
                            <ReportCard key={report.id} report={report} />
                        ))
                    ) : (
                        <p>You haven't submitted any reports yet.</p>
                    )}
                    <Link to='/reports' className='btn btn-outline-primary mt-2'>View All Reports</Link>
                </div>
                <div className='col-md-6'>
                    <h3>Recent Investigations</h3>
                    {recentInvestigations.length > 0 ? (
                        recentInvestigations.map((investigation) => (
                            <InvestigationCard key={investigation.id} investigation={investigation} />
                        ))
                    ) : (
                        <p>No recent investigations.</p>
                    )}
                    <Link to='/investigations' className='btn btn-outline-primary mt-2'>View All Investigations</Link>
                </div>
            </div>

            <div className='row'>
                <div className='col-12'>
                    <h3>Platform Overview</h3>
                    <DataVisualization />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;