import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getInvestigation } from '../services/api';
import ContributionForm from '../components/ContributionForm';
import '../styles/pages/Investigation.css';

const Investigation = () => {
    const { id } = useParams();
    const [investigation, setInvestigation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInvestigation = async () => {
            if (!id) {
                setError('Investigation ID is missing');
                setLoading(false);
                return;
            }
            try {
                const data = await getInvestigation(id);
                setInvestigation(data);
            } catch (err) {
                console.error('Failed to fetch investigation:', err);
                setError('Failed to fetch investigation');
            } finally {
                setLoading(false);
            }
        };
        fetchInvestigation();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className='alert alert-danger'>{error}</div>;
    if (!investigation) return <div>No investigation found</div>;

    return (
        <div className='investigation-container'>
            <h2>Investigation: {investigation.report?.title}</h2>
            <div className='report-details card mb-3'>
                <div className='card-body'>
                    <h5 className='card-title'>Report Details</h5>
                    <p className='card-text'>{investigation.report.description}</p>
                    <p className='card-text'>
                        <small className='text-muted'>
                            Status: {investigation.report.status} |
                            Started on: {new Date(investigation.created_at).toLocaleDateString()}
                        </small>
                    </p>
                </div>
            </div>

            <h3>Contributions</h3>
            <div className='contributions-list'>
                {investigation.contributions.map(contribution => (
                    <div key={contribution.id} className='contribution-item card mb-2'>
                        <div className='card-body'>
                            <p className='card-text'>{contribution.content}</p>
                            {contribution.contribution_type === 'evidence' && contribution.evidence_file && (
                                <div className='evidence-file'>
                                    <a href={contribution.evidence_file} target='_blank' rel='noreferrer'>View Evidence</a>
                                </div>
                            )}
                            <p className='card-text'>
                                <small className='text-muted'>
                                    Type: {contribution.contribution_type} |
                                    By: {contribution.anonymous ? 'Anonymous' : contribution.username} |
                                    On: {new Date(contribution.created_at).toLocaleDateString()}
                                </small>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <ContributionForm
                investigationId={id}
                onContributionSubmit={(newContribution) => {
                    setInvestigation(prev => ({
                        ...prev,
                        contributions: [...prev.contributions, newContribution]
                    }));
                }}
            />
        </div>
    );
};

export default Investigation;
                                        