import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setReports, setLoading, setError } from '../store/reportsSlice';
import { getReports } from '../services/api';
import styled from 'styled-components';

const ReportCard = styled.div`
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 1rem;
    margin: 1rem;
`;

const Reports: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { reports, loading, error } = useSelector((state: RootState) => state.report);

    useEffect(() => {
        const fetchReports = async () => {
            dispatch(setLoading(true));
            try {
                const data = await getReports();
                dispatch(setReports(data));
            } catch (error) {
                dispatch(setError('Failed to fetch reports'));
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchReports();
    }, [dispatch]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Reports</h1>
            {reports.map((report) => (
                <ReportCard key={report.id}>
                    <h2>{report.title}</h2>
                    <p>{report.description}</p>
                </ReportCard>
            ))}
        </div>
    );
};

export default Reports;