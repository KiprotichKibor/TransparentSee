import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Reports from './pages/Reports';
import Investigations from './pages/Investigations';
import Layout from './components/layout';
import UserProfile from './pages/UserProfile';
import SubmitReport from './pages/SubmitReport';
import Login from './components/Login';
import Registration from './components/Registration';

const App: React.FC = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/investigations" element={<Investigations />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/submit-report" element={<SubmitReport />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Registration />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;