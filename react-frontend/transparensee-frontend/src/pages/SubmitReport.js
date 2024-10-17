import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { createReport } from '../services/api';

const SubmitReport = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [regionId, setRegionId] = useState('');
    const [regions, setRegions] = useState([]);
    const [anonymous, setAnonymous] = useState(false);
    const [error, setError] = useState('');
    const history = useHistory();

    useEffect(() => {
        // Fetch regions
        // This is a placeholder for the actual API call
        setRegions([
            { id: 1, name: 'Region 1' },
            { id: 2, name: 'Region 2' },
            { id: 3, name: 'Region 3' },
        ]);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await createReport({ title, description, region, anonymous });
            history.push('/dashboard');
        } catch (err) {
            setError('Failed to submit report. Please try again.');
        }
    };

    return (
        <div className='container mt-5'>
            <h2>Submit a New Report</h2>
            {error && <div className='alert alert-danger'>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label htmlFor='title' className='form-label'>Title</label>
                    <input
                        type='text'
                        className='form-control'
                        id='title'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className='mb-3'>
                    <label htmlFor='description' className='form-label'>description</label>
                    <textarea
                        className='form-control'
                        id='description'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className='mb-3'>
                    <label htmlFor='region' className='form-label'>Region</label>
                    <select
                        className='form-control'
                        id = 'region'
                        value={regionId}
                        onChange={(e) => setRegionId(e.target.value)}
                        required
                    >
                        <option value=''>Select a Region</option>
                        {regions.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
                <div className='mb-3 form-check'>
                    <input
                        type='checkbox'
                        className='form-check-input'
                        id='anonymous'
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                    />
                    <label className='form-check-label' htmlFor='anonymous'>Submit anonymously</label>
                </div>
                <button type='submit' className='btn btn-primary'>Submit Report</button>
            </form>
        </div>
    );
};

export default SubmitReport;