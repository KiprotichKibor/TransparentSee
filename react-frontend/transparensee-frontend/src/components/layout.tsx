import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { logout } from '../services/api';

const Header = styled.header`
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavLinks = styled.div`
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

const LogoutButton = styled.button`
    background: none;
    border: none;
    color: white;
    cursor: pointer;
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
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem('token');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
      <>
        <Header>
          <Nav>
            <NavLinks>
              <StyledLink to="/">Home</StyledLink>
              <StyledLink to="/reports">Reports</StyledLink>
              <StyledLink to="/investigations">Investigations</StyledLink>
              {isLoggedIn && <StyledLink to="/submit-report">Submit Report</StyledLink>}
            </NavLinks>
            <NavLinks>
              {isLoggedIn ? (
                <>
                  <StyledLink to="/profile">Profile</StyledLink>
                  <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
                </>
              ) : (
                <>
                  <StyledLink to="/login">Login</StyledLink>
                  <StyledLink to="/register">Register</StyledLink>
                </>
              )}
            </NavLinks>
          </Nav>
        </Header>
        <Main>{children}</Main>
      </>
    );
};

export default Layout;