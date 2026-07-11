import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MessagesProvider } from './context/MessagesContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { Navbar, Footer } from './components';
import Home from './pages/Home';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import CompaniesPage from './pages/CompaniesPage';
import Login from './pages/auth/LoginPage';
import Register from './pages/auth/RegisterPage';
import PostJobPage from './pages/employer/PostJobPage';
import Profile from './pages/candidate/ProfilePage';
import MyApplications from './pages/candidate/MyApplications';
import SavedJobs from './pages/candidate/SavedJobs';
import Dashboard from './pages/candidate/Dashboard';
import EmployerDashboard from './pages/employer/Dashboard';
import ApplicantsPage from './pages/employer/ApplicantsPage';
import Messages from './pages/Messages';
import AdminDashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <MessagesProvider>
        <NotificationsProvider>
          <Router>
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-applications"
                  element={
                    <ProtectedRoute>
                      <MyApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/saved-jobs"
                  element={
                    <ProtectedRoute>
                      <SavedJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employer/dashboard"
                  element={
                    <ProtectedRoute employerOnly>
                      <EmployerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employer/post-job"
                  element={
                    <ProtectedRoute employerOnly>
                      <PostJobPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post-job"
                  element={
                    <ProtectedRoute employerOnly>
                      <PostJobPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employer/jobs/:id/applicants"
                  element={
                    <ProtectedRoute employerOnly>
                      <ApplicantsPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </Router>
        </NotificationsProvider>
      </MessagesProvider>
    </AuthProvider>
  );
}

export default App;
