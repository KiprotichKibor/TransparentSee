import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
    text-align: center;
`;

const Title = styled.h1`
    color: #2c3e50;
`;

const Subtitle = styled.h2`
    font-size: 1.2em;
    color: #34495e;
`;

const CTAButton = styled(Link)`
    display: inline-block;
    background-color: #3498db;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    text-decoration: none;
    margin-top: 20px;
    transition: background-color 0.3s;

    &:hover {
        background-color: #2980b9;
    }
`;

const Home: React.FC = () => {
    return (
        <HomeContainer>
            <Title>Welcome to TransparenSee</Title>
            <Subtitle>Empowering citizens for political accountability</Subtitle>
            <CTAButton to="/submit-report">Get Started</CTAButton>
        </HomeContainer>
    );
};

export default Home;