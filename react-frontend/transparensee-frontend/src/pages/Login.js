import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loginUser } = useContext(AuthContext);
    const history = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await loginUser(email, password);
            history.push('/dashboard');
        } catch (error) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className='container mt-5'>
            <h2>Login</h2>
            {error && <div className='alert alert-danger'>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label htmlFor='email' className='form-label'>Email</label>
                    <input
                        type='email'
                        className='form-control'
                        id='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className='mb-3'>
                    <label htmlFor='password' className='form-label'>Password</label>
                    <input
                        type='password'
                        className='form-control'
                        id='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type='submit' className='btn btn-primary'>Login</button>
            </form>
        </div>
    );
};

export default Login;