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

const PrivateRoute = ({ element }) => {
  const { user } = useContext(AuthContext);
  return user ? element : <Navigate to="/login" />;
};

const AdminRoute = ({ element }) => {
  const { isAdmin, loading } = useIsAdmin();
  const { user } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return user && isAdmin ? element : <Navigate to="/dashboard" />;
};

const ModeratorRoute = ({ element }) => {
  const { isModerator, loading } = useIsModerator();
  const { user } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return user && isModerator ? element : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <UserRoleProvider>
        <Router>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
              <Route path="/submit-report" element={<PrivateRoute element={<SubmitReport />} />} />
              <Route path="/investigation/:id" element={<PrivateRoute element={<Investigation />} />} />
              <Route path="/profile/:username" element={<PrivateRoute element={<UserProfile />} />} />
              <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
              <Route path="/manage-reports" element={<ModeratorRoute element={<ManageReports />} />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </UserRoleProvider>
    </AuthProvider>
  );
}

export default App;