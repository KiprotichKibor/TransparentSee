import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getReports, getInvestigations } from '../services/api';
import ReportCard from '../components/ReportCard';
import InvestigationCard from '../components/InvestigationCard';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import DataVisualization from '../components/DataVisualization';

const Dashboard = () => {
    const [reports, setReports] = useState([]);
    const [investigations, setInvestigations] = useState([]);
    const [reportPage, setReportPage] = useState(1);
    const [investigationPage, setInvestigationPage] = useState(1);
    const [reportFilters, setReportFilters] = useState('');
    const [investigationFilters, setInvestigationFilters] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);
    const [totalPages, setTotalPages] = useState(1);
    
    useEffect(() => {        
        const fetchData = async () => {
            setLoading(true);
            try {
                const [reportsResponse, investigationsResponse] = await Promise.all([
                    getReports(reportPage, reportFilters),
                    getInvestigations(investigationPage, investigationFilters)
                ]);
                setReports(reportsResponse.data);
                setInvestigations(investigationsResponse.data);
                
                const reportsTotalPages = Math.ceil(reportsResponse.data.count / 10);
                const investigationsTotalPages = Math.ceil(investigationsResponse.data.count / 10);

                setTotalPages(Math.max(reportsTotalPages, investigationsTotalPages));
            } catch (err) {
                setError('Failed to fetch data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [reportPage, investigationPage, reportFilters, investigationFilters]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className='alert alert-danger'>{error}</div>;

    return (
        <div className='container mt-5'>
            <h2>Welcome, {user.username}!</h2>
            <DataVisualization />
            <div className='row mt-4'>
                <div className='col-md-6'>
                    <h3>Recent Reports</h3>
                    <SearchBar onSearch={setReportFilters} type='report' />
                    {reports.results && reports.results.length > 0 ? (
                        reports.results.map((report) => (
                            <ReportCard key={report.id} report={report} />
                        ))
                    ) : (
                        <p>No reports found.</p>
                    )}
                    <Pagination
                        currentPage={reportPage}
                        onPageChange={setReportPage}
                        totalPages={totalPages}
                    />
                    <Link to='/submit-report' className='btn btn-primary mt-3'>Submit New Report</Link>
                </div>
                <div className='col-md-6'>
                    <h3>Active Investigations</h3>
                    <SearchBar onSearch={setInvestigationFilters} type='investigation' />
                    {investigations.results && investigations.results.length > 0 ? (
                        investigations.results.map((investigation) => (
                            <InvestigationCard key={investigation.id} investigation={investigation} />
                        ))
                    ) : (
                        <p>No investigations found.</p>
                    )}
                    <Pagination
                        currentPage={investigationPage}
                        onPageChange={setInvestigationPage}
                        totalPages={totalPages}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;