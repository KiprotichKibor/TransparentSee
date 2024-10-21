import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReport, getRegions } from '../services/api';

const SubmitReport = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [region, setRegion] = useState('');
    const [regions, setRegions] = useState([]);
    const [evidenceFiles, setEvidenceFiles] = useState([]);
    const [anonymous, setAnonymous] = useState(false);
    const [errors, setErrors] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const response = await getRegions();
                setRegions(response.data);
            } catch (error) {
                setErrors('Failed to fetch regions:', error);
            }
        };
        fetchRegions();
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = 'Title is required';
        if (description.trim().length < 10) newErrors.description = 'Description must be at least 10 characters long';
        if (!region) newErrors.region = 'Please select a region';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (e) => {
        setEvidenceFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('region', region);
        formData.append('anonymous', anonymous);

        evidenceFiles.forEach((file, index) => {
            formData.append(`evidence_files`, file);
        });

        try {
            console.log('Submitting report:', Object.fromEntries(formData));
            const response = await createReport(formData);
            console.log('Report submitted successfully:', response);
            setSuccessMessage('Report submitted successfully');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error) {
            console.error('Failed to submit report:', error);
            setErrors({ submit: 'Failed to submit report. Please try again later.'});
        } finally {
            setLoading(false);
        }
    };  

    return (
        <div className='container mt-5'>
            <h2>Submit a New Report</h2>
            {successMessage && <div className='alert alert-success'>{successMessage}</div>}
            {errors.submit && <div className='alert alert-danger'>{errors.submit}</div>}
            <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label htmlFor='title' className='form-label'>Title</label>
                    <input
                        type='text'
                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                        id='title'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    {errors.title && <div className='invalid-feedback'>{errors.title}</div>}
                </div>
                <div className='mb-3'>
                    <label htmlFor='description' className='form-label'>description</label>
                    <textarea
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        id='description'
                        rows='3'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                    {errors.description && <div className='invalid-feedback'>{errors.description}</div>}
                </div>
                <div className='mb-3'>
                    <label htmlFor='region' className='form-label'>Region</label>
                    <select
                        className={`form-control ${errors.region ? 'is-invalid' : ''}`}
                        id = 'region'
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        required
                    >
                        <option value=''>Select a Region</option>
                        {regions.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    {errors.region && <div className='invalid-feedback'>{errors.region}</div>}
                </div>
                <div className='mb-3'>
                    <label htmlFor='evidence' className='form-label'>Evidence Files</label>
                    <input
                        type='file'
                        className='form-control'
                        id='evidence'
                        multiple
                        onChange={handleFileChange}
                    />
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
                <button type='submit' className='btn btn-primary' disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </form>
        </div>
    );
};

export default SubmitReport;