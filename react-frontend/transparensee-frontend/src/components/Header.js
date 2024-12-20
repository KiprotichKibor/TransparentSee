import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useIsAdmin, useIsModerator } from '../context/UserRoleContext';
import { getUserProfile } from '../services/api';

const Header = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const { isAdmin } = useIsAdmin();
  const { isModerator } = useIsModerator();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && user.username) {
        try {
          const response = await getUserProfile(user.username);
          setUserProfile(response.data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">TransparenSee</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-nav" id="navbarNav">
          {user ? (
            <>
              <Link className="nav-item nav-link" to="/dashboard">Dashboard</Link>
              <Link className="nav-item nav-link" to="/reports">Reports</Link>
              <Link className="nav-item nav-link" to="/investigations">Investigation</Link>
              <Link className="nav-item nav-link" to="/submit-report">Submit Report</Link>
              {(isAdmin || isModerator) && (
                <Link className="nav-item nav-link" to="/manage-reports">Manage Reports</Link>
              )}
              {isAdmin && (
                <Link className="nav-item nav-link" to="/admin">Admin Dashboard</Link>
              )}
              <Link className="nav-item nav-link" to={`/profile/${user.username}`}>
                Profile
                {userProfile && userProfile.location && ` (${userProfile.location})`}
              </Link>
              <button className="nav-item nav-link btn btn-link" onClick={logoutUser}>Logout</button>
            </>
          ) : (
            <>
              <Link className="nav-item nav-link" to="/login">Login</Link>
              <Link className="nav-item nav-link" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;