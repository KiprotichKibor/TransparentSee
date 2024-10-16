import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { register } from '../services/api';

const Form = styled.form`
    display: flex;
    flex-direction: column;
    max-width: 300px;
    margin: 0 auto;
`;

const Input = styled.input`
    margin-bottom: 10px;
    padding: 8px;
`;

const Button = styled.button`
    padding: 10px;
    background-color: #3498db;
    color: white;
    border: none;
    cursor: pointer;
`;

const ErrorMessage = styled.div`
    color: red;
`;

const Registration: React.FC = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await register({ email, username, first_name: firstName, last_name: lastName, password });
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (error: any) {
            if (error.response) {
                setError(error.response.data.detail || 'Registration failed. Please try again.');
            } else if (error.request) {
                setError('No response from server. Please try again later.');
            } else {
                setError('An unexpected error occurred. Please try again later.');
            }
            console.error('Registration error:', error);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <h2>Register</h2>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <Input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
            />
            <Input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
            />
            <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <Button type="submit">Register</Button>
        </Form>
    );
};

export default Registration;