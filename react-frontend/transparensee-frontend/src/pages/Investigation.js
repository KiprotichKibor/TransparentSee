import React, { useState, useEffect, useCallback } from 'react';
import { getInvestigation, updateInvestigationStatus, voteContribution, assignRole, createTask } from '../services/api';
import ContributionForm from '../components/ContributionForm';
import './Investigation.css';

const Investigation = ({ id }) => {
    const [investigation, setInvestigation] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [newRole, setNewRole] = useState({ userId: '', role: '' });
    const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });
    const [, setError] = useState('');

    const fetchInvestigation = useCallback(async () => {
        try {
            const response = await getInvestigation(id);
            setInvestigation(response.data);
        } catch (err) {
            setError('Failed to fetch investigation');
        }
    }, [id]);

    useEffect(() => {
        fetchInvestigation();
    }, [fetchInvestigation]);

    async function handleStatusUpdate() {
        try {
            await updateInvestigationStatus(id, newStatus);
            fetchInvestigation();
        } catch (err) {
            setError('Failed to update status');
        }
    }

    const handleVote = async (contributionId, vote) => {
        try {
            await voteContribution(id, contributionId, vote);
            fetchInvestigation();
        } catch (err) {
            setError('Failed to vote on contribution');
        }
    };

    const handleRoleAssignment = async () => {
        try {
            await assignRole(id, newRole.userId, newRole.role);
            fetchInvestigation();
        } catch (err) {
            setError('Failed to assign role');
        }
    };

    const handleCreateTask = async () => {
        try {
            await createTask(id, newTask);
            fetchInvestigation();
        } catch (err) {
            setError('Failed to create task');
        }
    };

    return (
        <div className='investigation-container'>
            <h2>Investigation: {investigation.report.title}</h2>
            <div className='report-details card mb-3'>
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

            <div className='status-update'>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value=''>Select new status</option>
                    <option value='in_progress'>In Progress</option>
                    <option value='closed'>Closed</option>
                </select>
                <button onClick={handleStatusUpdate}>Update Status</button>
            </div>

            <div className='assign-role'>
                <input
                    type='text'
                    placeholder='User ID'
                    value={newRole.userId}
                    onChange={(e) => setNewRole({ ...newRole, userId: e.target.value })}
                />
                <select
                    value={newRole.role}
                    onChange={(e) => setNewRole({ ...newRole, role: e.target.value })}
                >
                    <option value=''>Select role</option>
                    <option value='lead'>Lead</option>
                    <option value='contributor'>Contributor</option>
                </select>
                <button onClick={handleRoleAssignment}>Assign Role</button>
            </div>

            <div className='create-task'>
                <input
                    type='text'
                    placeholder='Task title'
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                <textarea
                    placeholder='Task description'
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
                <input
                    type='date'
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, duedate: e.target.value })}
                />
                <button onClick={handleCreateTask}>Create Task</button>
            </div>

            <h3>Contributions</h3>
            <div className='contributions-list'>
                {investigation.contributions.map(contribution => (
                    <div key={contribution.id} className='contribution-item card mb-2'>
                        <div className='card-body'>
                            <p className='card-text'>{contribution.content}</p>
                            {contribution.contribution_type === 'evidence' && contribution.evidence_file && (
                                <div className='evidence-file'>
                                    <a href={contribution.evidence_file} target="_blank" rel="noopener noreferrer">View Evidence</a>
                                </div>
                            )}
                            <p className='card-text'>
                                <small className='text-muted'>
                                    Type: {contribution.contribution_type} |
                                    By: {contribution.anonymous ? 'Anonymous' : contribution.user.username} |
                                    On: {new Date(contribution.created_at).toLocaleDateString()}
                                </small>
                            </p>
                        </div>
                        <div className='vote-buttons'>
                            <button onClick={() => handleVote(contribution.id, 1)}>Upvote</button>
                            <button onClick={() => handleVote(contribution.id, -1)}>Downvote</button>
                        </div>
                    </div>
                ))}
            </div>

            <ContributionForm 
                investigationId={id}
                onContributionSubmit={fetchInvestigation}
            />
        </div>
    );
};

export default Investigation;