import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { login } from '../services/api';

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

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await login({ email, password });
            localStorage.setItem('token', response.data.access);
            alert('Login successful');
            navigate('/');
        } catch (error: any) {
            if (error.response) {
                setError(error.response.data.detail || 'Login failed. Please try again.');
            } else if (error.request) {
                setError('No response from server. Please try again later.');
            } else {
                setError('An unexpected error occurred. Please try again later.');
            }
            console.error('Login eroor:', error);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <h2>Login</h2>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <Button type="submit">Login</Button>
        </Form>
    );
};

export default Login;