import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getInvestigation, createContribution } from '../services/api';

const Investigation = () => {
    const { id } = useParams();
    const [investigation, setInvestigation] = useState(null);
    const [newContribution, setNewContribution] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInvestigation = async () => {
            try {
                const response = await getInvestigation(id);
                setInvestigation(response.data);
            } catch (error) {
                setError('Fialed to load investigation details');
            }
        };
        fetchInvestigation();
    }, [id]);

    const handleSubmitContribution = async (e) => {
        e.preventDefault();
        setError('');
        try {
        const response = await createContribution(id, { content: newContribution, contribution_type: 'comment' });
        setInvestigation(prev => ({ 
            ...prev,
            contributions: [...prev.contributions, response.data]
        }));
        setNewContribution('');
        } catch (error) {
            setError('Failed to submit contribution. Please try again later.');
        }
    };

    if (error) {
        return <div className='alert alert-danger'>{error}</div>;
    }

    if (!investigation) {
        return <div>Loading...</div>;
    }

    return (
        <div className='container mt-5'>
            <h2>Investigation: {investigation.report.title}</h2>
            <div className='card mb-3'>
                <div className='card-body'>
                    <h5 className='card-title'>Report Details</h5>
                    <p className='card-text'>{investigation.report.description}</p>
                    <p className='card-text'>
                        <small className='text-muted'>
                            Status: {investigation.status} |
                            Started on: {new Date(investigation.created_at).toLocaleDateString()}
                        </small>
                    </p>
                </div>
            </div>

            <h3>Contributions</h3>
            {investigation.contributions.map(contribution => (
                <div key={contribution.id} className='card mb-2'>
                    <div className='card-body'>
                        <p className='card-text'>{contribution.content}</p>
                        <p className='card-text'>
                            <small className='text-muted'>
                                By: {contribution.anonymous ? 'Anonymous' : contribution.user.username} |
                                On: {new Date(contribution.created_at).toLocaleDateString()}
                            </small>
                        </p>
                    </div>
                </div>
            ))}

            <h4 className='mt-4'>Add a contribution</h4>
            <form onSubmit={handleSubmitContribution}>
                <div className='mb-3'>
                    <textarea
                        className='form-control'
                        rows='3'
                        value={newContribution}
                        onChange={e => setNewContribution(e.target.value)}
                        required
                    ></textarea>
                </div>
                <button type='submit' className='btn btn-primary'>Submit Contribution</button>
            </form>
        </div>
    );
};

export default Investigation;