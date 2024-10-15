import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setReports, setLoading, setError } from '../store/reportsSlice';
import { getReports } from '../services/api';
import styled from 'styled-components';

interface Report {
    id: number;
    title: string;
    description: string;
    status: string;
    created_at: string;
}

const ReportContainer = styled.div`
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

const ReportTitle = styled.h2`
    color: #2c3e50;
    margin-bottom: 10px;
`;

const ReportMeta = styled.div`
    color: #7f8c8d;
    font-size: 0.9em;
    margin-bottom: 10px;
`;

const ReportDescription = styled.p`
    color: #34495e;
`;

const Reports: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getReports();
                setReports(data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch reports');
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Reports</h1>
            {reports.map((report) => (
                <ReportContainer key={report.id}>
                    <ReportTitle>{report.title}</ReportTitle>
                    <ReportMeta>
                        <div>Status: {report.status}</div>
                        <div>Created at: {report.created_at}</div>
                    </ReportMeta>
                    <ReportDescription>{report.description}</ReportDescription>
                </ReportContainer>
            ))}
        </div>
    );
};

export default Reports;