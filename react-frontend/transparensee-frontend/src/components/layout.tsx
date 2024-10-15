import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Header = styled.header`
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const StyledLink = styled(Link)`
    color: white;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
`;

const Main = styled.main`
    padding: 2rem;
`;

interface LayoutProps {
    children: React.ReactNode;
    }

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
      <>
        <Header>
          <Nav>
            <StyledLink to="/">Home</StyledLink>
            <StyledLink to="/reports">Reports</StyledLink>
            <StyledLink to="/investigations">Investigations</StyledLink>
            <StyledLink to="/profile">Profile</StyledLink>
            <StyledLink to="/submit-report">Submit Report</StyledLink>
          </Nav>
        </Header>
        <Main>{children}</Main>
      </>
    );
};

export default Layout;