import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead } from '../services/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await getNotifications();
            setNotifications(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch notifications');
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(notifications.filter((n) => n.id !== id));
        } catch (err) {
            setError('Failed to mark notification as read');
        }
    };

    if (loading) return <div>Loading notifications...</div>;
    if (error) return <div className='alert alert-danger'>{error}</div>;

    return (
        <div className='notifications'>
            <h3>Notifications</h3>
            {notifications.length === 0 ? (
                <p>No new notifications</p>
            ) : (
                <ul className='list-group'>
                    {notifications.map(notification => (
                        <li key={notification.id} className='list-group-item d-flex justify-content-between align-items-center'>
                            {notification.message}
                            <button
                                className='btn btn-sm btn-outline-primary'
                                onClick={() => handleMarkAsRead(notification.id)}
                            >
                                Mark as Read
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Notifications;       