import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { UserRoleProvider, useIsAdmin, useIsModerator } from './context/UserRoleContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubmitReport from './pages/SubmitReport';
import Investigation from './pages/Investigation';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import ManageReports from './pages/ManageReports';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { user } = useContext(AuthContext);
  return (
    <Route
      {...rest}
      render={props =>
        user ? <Component {...props} /> : <Navigate to="/login" />
      }
    />
  );
};

const AdminRoute = ({ component: Component, ...rest }) => {
  const { isAdmin, loading } = useIsAdmin();
  const { user } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return (
    <Route
      {...rest}
      render={props =>
        user && isAdmin ? <Component {...props} /> : <Navigate to="/dashboard" />
      }
    />
  );
};

const ModeratorRoute = ({ component: Component, ...rest }) => {
  const { isModerator, loading } = useIsModerator();
  const { user } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return (
    <Route
      {...rest}
      render={props =>
        user && isModerator ? <Component {...props} /> : <Navigate to="/dashboard" />
      }
    />
  );
};

function App() {
    return (
      <AuthProvider>
        <UserRoleProvider>
          <Router>
            <div className="App">
              <Header />
              <main className="container">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/submit-report" element={<SubmitReport />} />
                  <Route path="/investigation/:id" element={<Investigation />} />
                  <Route path="/profile/:username" element={<UserProfile />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/manage-reports" element={<ManageReports />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </UserRoleProvider>
      </AuthProvider>
    );
  }

export default App;