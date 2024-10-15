import React, { useState } from 'react';
import styled from 'styled-components';
import { submitReport } from '../services/api';

const FormContainer = styled.div`
    max-width: 600px;
    margin: 0 auto;
`;

const FormGroup = styled.div`
    margin-bottom: 20px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 5px;
    color: #2c3e50;
`;

const Input = styled.input`
    width: 100%;
    padding: 8px;
    border: 1px solid #bdc3c7;
    border-radius: 4px;
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 8px;
    border: 1px solid #bdc3c7;
    border-radius: 4px;
`;

const SubmitButton = styled.button`
    background-color: #2ecc71;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #27ae60;
    }
`;

const SubmitReport: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [region, setRegion] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await submitReport({ title, description, region });
            alert('Report submitted successfully');
            setTitle('');
            setDescription('');
            setRegion('');
        } catch (error) {
            alert('Failed to submit report. Please try again.');
        }
    };

    return (
        <FormContainer onSubmit={handleSubmit}>
            <h1>Submit a Report</h1>
                <FormGroup>
                    <Label htmlFor="title">Title</Label>
                    <Input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </FormGroup>
                <FormGroup>
                    <Label htmlFor="description">Description</Label>
                    <TextArea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={5}
                    />
                </FormGroup>
                <FormGroup>
                    <Label htmlFor="region">Region</Label>
                    <Input
                        type="text"
                        id="region"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                    />
                </FormGroup>
                <SubmitButton type="submit">Submit Report</SubmitButton>
        </FormContainer>
    );
};

export default SubmitReport;