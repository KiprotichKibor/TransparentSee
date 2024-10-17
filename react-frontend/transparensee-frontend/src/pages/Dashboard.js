import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getReports, getInvestigations } from '../services/api';
import ReportCard from '../components/ReportCard';
import InvestigationCard from '../components/InvestigationCard';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';

const Dashboard = () => {
    const [reports, setReports] = useState([]);
    const [investigations, setInvestigations] = useState([]);
    const [reportPage, setReportPage] = useState(1);
    const [investigationPage, setInvestigationPage] = useState(1);
    const [reportSearch, setReportSearch] = useState('');
    const [investigationSearch, setInvestigationSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    const fetchReports = async () => {
        try {
            const response = await getReports(reportPage, reportSearch);
            setReports(response.data.results);
        } catch (err) {
            setError('Failed to fetch reports');
        }
    };

    const fetchInvestigations = async () => {
        try {
            const response = await getInvestigations(investigationPage, investigationSearch);
            setInvestigations(response.data.results);
        } catch (err) {
            setError('Failed to fetch investigations');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchReports(), fetchInvestigations()]);
            setLoading(false);
        };
        fetchData();
    }, [reportPage, reportSearch, investigationPage, investigationSearch]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className='alert alert-danger'>{error}</div>;

    return (
        <div className='container mt-5'>
            <h2>Welcome, {user.username}!</h2>
            <div className='row mt-4'>
                <div className='col-md-6'>
                    <h3>Recent Reports</h3>
                    <SearchBar onSearch={setReportSearch} placeholder='Search reports...' />
                    {reports.map((report) => (
                        <ReportCard key={report.id} report={report} />
                    ))}
                    <Pagination
                        currentPage={reportPage}
                        onPageChange={setReportPage}
                        totalPages={Math.ceil(reports.length / 10)}
                    />
                    <Link to='/submit-report' className='btn btn-primary mt-3'>Submit New Report</Link>
                </div>
                <div className='col-md-6'>
                    <h3>Active Investigations</h3>
                    <SearchBar onSearch={setInvestigationSearch} placeholder='Search investigations...' />
                    {investigations.map((investigation) => (
                        <InvestigationCard key={investigation.id} investigation={investigation} />
                    ))}
                    <Pagination
                        currentPage={investigationPage}
                        onPageChange={setInvestigationPage}
                        totalPages={Math.ceil(investigations.length / 10)}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;