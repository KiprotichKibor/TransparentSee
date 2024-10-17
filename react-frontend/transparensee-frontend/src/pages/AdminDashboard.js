import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useUserRole } from '../context/UserRoleContext';
import { getUsers, updateUserRole } from '../services/api';
import DataVisualization from '../components/DataVisualization';

const AdminDashboard = () => {
    const { userRole, loading } = useUserRole();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            setUsers(response.data);
        } catch (err) {
            setError('Failed to fetch users');
        }
    };

    useEffect(() => {
        if (userRole === 'admin') {
            fetchUsers();
        }
    }, [userRole]);

        const handleRoleChange = async (userId, newRole) => {
            try {
                await updateUserRole(userId, newRole);
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, role: newRole } : user
                ));
            } catch (err) {
                setError('Failed to update user role');
            }
        };

        if (loading) return <p>Loading...</p>;
        if (userRole !== 'admin') return <Redirect to="/dashboard" />;

        return (
            <div className='container mt-5'>
                <h2>Admin Dashboard</h2>
                <DataVisualization />
                <h3 className='mt-4'>Manage Users</h3>
                {error && <div className='alert alert-danger'>{error}</div>}
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Current Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    >
                                        <option value='user'>User</option>
                                        <option value='moderator'>Moderator</option>
                                        <option value='admin'>Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

export default AdminDashboard;