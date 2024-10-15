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

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await login({ username, password });
            localStorage.setItem('token', response.data.token);
            alert('Login successful');
            navigate('/');
        } catch (error) {
            alert('Login failed. Please try again.');
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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