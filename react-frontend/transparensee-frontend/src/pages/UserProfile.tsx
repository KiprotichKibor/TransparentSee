import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getUserProfile} from '../services/api';

interface UserProfile {
    username: string;
    email: string;
    bio: string;
    reputation_score: number;
    badges: string[];
}

const ProfileContainer = styled.div`
    max-width: 600px;
    margin: 0 auto;
`;

const ProfileHeader = styled.h1`
    color: #2c3e50;
`;

const ProfileInfo = styled.div`
    margin-bottom: 20px;
`;

const BadgeContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

const Badge = styled.div`
    background-color: #3498db;
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 0.9em;
`;

const UserProfile: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUserProfile();
                setUserProfile(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch user profile');
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <ProfileContainer>
            <ProfileHeader>User Profile</ProfileHeader>
            <ProfileInfo>
                <div>Username: {userProfile?.username}</div>
                <div>Email: {userProfile?.email}</div>
                <div>Bio: {userProfile?.bio}</div>
                <div>Reputation Score: {userProfile?.reputation_score}</div>
                <BadgeContainer>
                    {userProfile?.badges.map((badge, index) => (
                        <Badge key={index}>{badge}</Badge>
                    ))}
                </BadgeContainer>
            </ProfileInfo>
        </ProfileContainer>
    );
};

export default UserProfile;