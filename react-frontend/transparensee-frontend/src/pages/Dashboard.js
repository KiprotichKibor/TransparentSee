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
    
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await getReports(reportPage, reportFilters);
                setReports(response.data.results);
                setTotalPages(Math.ceil(response.data.count / 10));
            } catch (err) {
                setError('Failed to fetch reports');
            }
        };

        const fetchInvestigations = async () => {
            try {
                const response = await getInvestigations(investigationPage, investigationFilters);
                setInvestigations(response.data.results);
                setTotalPages(Math.ceil(response.data.count / 10));
            } catch (err) {
                setError('Failed to fetch investigations');
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchReports(), fetchInvestigations()]);
            setLoading(false);
        };

        fetchData();
    }, [reportPage, reportFilters, investigationPage, investigationFilters]); // No need to include fetchReports and fetchInvestigations here

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
                    {reports.map((report) => (
                        <ReportCard key={report.id} report={report} />
                    ))}
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
                    {investigations?.results?.map((investigation) => (
                        <InvestigationCard key={investigation.id} investigation={investigation} />
                    )) || <p>No investigation found.</p>}
                    {investigations && investigations.count > 0 && (
                        <Pagination
                            currentPage={investigationPage}
                            onPageChange={setInvestigationPage}
                            totalPages={totalPages}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;