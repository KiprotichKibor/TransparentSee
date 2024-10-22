import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvestigation, addContribution } from '../services/api';
import ContributionForm from '../components/ContributionForm';

const InvestigationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
        if (err.response && err.response.status === 404) {
          navigate('/404');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInvestigation();
  }, [id, navigate]);

  const handleNewContribution = async (contributionData) => {
    try {
      const response = await addContribution(id, contributionData);
      setInvestigation(prev => ({
        ...prev,
        contributions: [...prev.contributions, response.data]
      }));
    } catch (err) {
      setError('Failed to add contribution');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!investigation) return <div>Investigation not found</div>;

  return (
    <div className="container mt-4">
      <h2>Investigation: {investigation.title}</h2>
      <p>Status: {investigation.status}</p>
      <h3>Contributions</h3>
      {investigation.contributions.map(contribution => (
        <div key={contribution.id} className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">{contribution.contribution_type}</h5>
            <p className="card-text">{contribution.content}</p>
            {contribution.evidence_file && (
              <a href={contribution.evidence_file} target="_blank" rel="noopener noreferrer">View Evidence</a>
            )}
            <p className="card-text">
              <small className="text-muted">
                By: {contribution.username} on {new Date(contribution.created_at).toLocaleString()}
              </small>
            </p>
          </div>
        </div>
      ))}
      <ContributionForm 
        investigationId={id} 
        onContributionSubmit={handleNewContribution}
      />
    </div>
  );
};

export default InvestigationDetail;