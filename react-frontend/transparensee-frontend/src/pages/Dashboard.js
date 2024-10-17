import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ReportCard from '../components/ReportCard';
import InvestigationCard from '../components/InvestigationCard';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [reports, setReports] = useState([]);
    const [investigations, setInvestigations] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const reportsData = await getReports();
            const investigationsData = await getInvestigations();
            setReports(reportsData.data);
            setInvestigations(investigationsData.data);
        };
        fetchData();
    }, []);

    return (
        <div className='container mt-5'>
            <h2>Welcome, {user.username}!</h2>
            <div className='row mt-4'>
                <div className='col-md-6'>
                    <h3>Recent Reports</h3>
                    {reports.map((report) => (
                        <ReportCard key={report.id} report={report} />
                    ))}
                    <Link to='/submit-report' className='btn btn-primary mt-3'>Submit New Report</Link>
                </div>
                <div className='col-md-6'>
                    <h3>Active Investigations</h3>
                    {investigations.map((investigation) => (
                        <InvestigationCard key={investigation.id} investigation={investigation} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;