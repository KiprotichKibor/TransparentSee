import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getInvestigations } from '../services/api';

interface Investigation {
    id: number;
    report_title: string;
    description: string;
    status: string;
    created_at: string;
}

const InvestigationContainer = styled.div`
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

const InvestigationTitle = styled.h2`
    color: #2c3e50;
    margin-bottom: 10px;
`;

const InvestigationMeta = styled.div`
    color: #7f8c8d;
    font-size: 0.9em;
    margin-bottom: 10px;
`;

const InvestigationDescription = styled.p`
    color: #34495e;
`;

const Investigations: React.FC = () => {
    const [investigations, setInvestigations] = useState<Investigation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvestigations = async () => {
            try {
                const data = await getInvestigations();
                setInvestigations(data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch investigations');
                setLoading(false);
            }
        };

        fetchInvestigations();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Ongoing Investigations</h1>
            {investigations.map((investigation) => (
                <InvestigationContainer key={investigation.id}>
                    <InvestigationTitle>{investigation.report_title}</InvestigationTitle>
                    <InvestigationMeta>
                        <span>Status: {investigation.status}</span>
                        <br />
                        <span>Created at: {investigation.created_at}</span>
                    </InvestigationMeta>
                    <InvestigationDescription>{investigation.description}</InvestigationDescription>
                </InvestigationContainer>
            ))}
        </div>
    );
};

export default Investigations;