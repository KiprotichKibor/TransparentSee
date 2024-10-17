import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserRoleProvider } from './context/UserRoleContext';
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

function App() {
    return (
        <AuthProvider>
        <Router>
            <div className="App">
                <Header />
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route path="/login" component={Login} />
                    <Route path="/register" component={Register} />
                    <Route path="/dashboard" component={Dashboard} />
                    <Route path="/submit-report" component={SubmitReport} />
                    <Route path="/investigation/:id" component={Investigation} />
                    <Route path="/profile/:username" component={UserProfile} />
                    <Route path="/admin" component={AdminDashboard} />
                </Switch>
                <Footer />
            </div>
        </Router>
        </AuthProvider>
    );
}

export default App;