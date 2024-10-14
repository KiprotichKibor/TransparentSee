import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Reports from './pages/Reports';
import Investigations from './pages/Investigations';
import Layout from './components/layout';

const App: React.FC = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/investigations" element={<Investigations />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;