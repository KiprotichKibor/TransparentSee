import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useUserRole, useIsAdmin, useIsModerator } from '../context/UserRoleContext';

const Header = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const { userRole } = useUserRole();
  const { isAdmin } = useIsAdmin();
  const { isModerator } = useIsModerator();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/">TransparenSee</Link>
      <div className="navbar-nav">
        {user ? (
          <>
            <Link className="nav-item nav-link" to="/dashboard">Dashboard</Link>
            <Link className="nav-item nav-link" to="/submit-report">Submit Report</Link>
            {(isAdmin || isModerator) && (
              <Link className="nav-item nav-link" to="/manage-reports">Manage Reports</Link>
            )}
            {isAdmin && (
              <Link className="nav-item nav-link" to="/admin">Admin Dashboard</Link>
            )}
            <Link className="nav-item nav-link" to={`/profile/${user.username}`}>Profile</Link>
            <button className="nav-item nav-link btn btn-link" onClick={logoutUser}>Logout</button>
          </>
        ) : (
          <>
            <Link className="nav-item nav-link" to="/login">Login</Link>
            <Link className="nav-item nav-link" to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;