import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../services/api';

const UserProfile = () => {
    const { username } = useParams();
    const { user: currentUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUserProfile(username);
                setProfile(response.data);
                setBio(response.data.bio || '');
                setLocation(response.data.location || '');
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
                setError('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await updateUserProfile(username, { bio, location });
            setProfile(response.data);
            setEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className='alert alert-danger'>{error}</div>;
    if (!profile) return <div>User not found</div>;

    return (
        <div className='container mt-5'>
            <h2>{username}'s Profile</h2>
            {editing ? (
                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor='bio' className='form-label'>Bio</label>
                        <textarea
                            className='form-control'
                            id='bio'
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        ></textarea>
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='location' className='form-label'>Location</label>
                        <input
                            type='text'
                            className='form-control'
                            id='location'
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                    <button type='submit' className='btn btn-primary' disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type='button' className='btn btn-secondary ms-2' onClick={() =>
                        setEditing(false)}>
                        Cancel
                    </button>
                </form>
            ) : (
                <div>
                    <p><strong>Bio</strong>{profile.bio}</p>
                    <p><strong>Location</strong>{profile.location}</p>
                    <p><strong>Reputation Score</strong>{profile.reputation_score}</p>
                    <h3>Badges</h3>
                    {profile.badges && profile.badges.length > 0 ? (
                        <ul>
                            {profile.badges.map((badge) => (
                                <li key={badge.id}>{badge.name} - {badge.description}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No badges earned yet</p>
                    )}
                    {currentUser && currentUser.username === username && (
                        <button className='btn btn-primary' onClick={() => setEditing(true)}>
                            Edit Profile
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserProfile;