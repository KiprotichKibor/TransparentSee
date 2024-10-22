import React, { useContext, useEffect } from 'react';
import { getCurrentUser } from './services/auth';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { UserRoleProvider, useIsAdmin, useIsModerator } from './context/UserRoleContext';
import Header from './components/Header';
import Footer from './components/Footer';
import InvestigationDetail from './pages/InvestigationDetail';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubmitReport from './pages/SubmitReport';
import Investigation from './pages/Investigation';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import ManageReports from './pages/ManageReports';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import './styles/main.css';
import './styles/utilities.css';

const PrivateRoute = ({ element }) => {
  const { user } = useContext(AuthContext);
  return user ? element : <Navigate to="/login" />;
};

const AdminRoute = ({ element }) => {
  const { isAdmin, loading } = useIsAdmin();
  const { user } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return user && isAdmin ? element : <Navigate to="/Admindashboard" />;
};

const ModeratorRoute = ({ element }) => {
  const { isModerator, loading } = useIsModerator();
  const { user } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return user && isModerator ? element : <Navigate to="/ManageReports" />;
};

function App() {
  const { setUser } = useContext(AuthContext);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.error('Failed to check user', error);
      }
    };
    checkUser();
  }, [setUser]);

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
              <Route path="/reports" element={<PrivateRoute element={<Reports />} />} />
              <Route path="/submit-report" element={<PrivateRoute element={<SubmitReport />} />} />
              <Route path="/investigation/:id" element={<PrivateRoute element={<Investigation />} />} />
              <Route path="/profile/:username" element={<PrivateRoute element={<UserProfile />} />} />
              <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
              <Route path="/investigation-detail/:id" element={<PrivateRoute element={<InvestigationDetail />} />} />
              <Route path="/manage-reports" element={<ModeratorRoute element={<ManageReports />} />} />
              <Route path="/report/:id" element={<PrivateRoute element={<ReportDetail />} />} />
              <Route path="/investigations" element={<PrivateRoute element={<Investigation />} />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </UserRoleProvider>
    </AuthProvider>
  );
};

export default App;