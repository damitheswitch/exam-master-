import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import LoginPage from '@/pages/Auth/LoginPage';
import RegisterPage from '@/pages/Auth/RegisterPage';
import ForgotPasswordPage from '@/pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/Auth/ResetPasswordPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminDashboard from '@/pages/Admin/AdminDashboard';
import UserManagementPage from '@/pages/Admin/UserManagementPage';
import QuestionManagementPage from '@/pages/TeacherAdmin/QuestionManagementPage';
import ExamManagementPage from '@/pages/TeacherAdmin/ExamManagementPage';
import StudentPerformancePage from '@/pages/TeacherAdmin/StudentPerformancePage';
import StudentDashboard from '@/pages/Student/StudentDashboard';
import AvailableExamsPage from '@/pages/Student/AvailableExamsPage';
import TakeExamPage from '@/pages/Student/TakeExamPage';
import ExamResultsPage from '@/pages/Student/ExamResultsPage';
import HomePage from '@/pages/HomePage';
import TestPage from './TestPage';
import { motion } from 'framer-motion';
import { initializeTestData } from '@/data/testData';

export const AuthContext = createContext(null);

const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = React.useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      // Initialize test data
      initializeTestData();
      
      const storedUser = localStorage.getItem('exammaster_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('exammaster_user', JSON.stringify(userData));
    setUser(userData);
    toast({ title: "Login Successful", description: `Welcome back, ${userData.name}!` });
  };

  const logout = () => {
    localStorage.removeItem('exammaster_user');
    setUser(null);
    toast({ title: "Logout Successful", description: "You have been logged out." });
  };
  
  const updateUser = (updatedUserData) => {
    const currentUsers = JSON.parse(localStorage.getItem('exammaster_users') || '[]');
    const userIndex = currentUsers.findIndex(u => u.id === updatedUserData.id);
    if (userIndex > -1) {
      currentUsers[userIndex] = { ...currentUsers[userIndex], ...updatedUserData };
      localStorage.setItem('exammaster_users', JSON.stringify(currentUsers));
      if (user && user.id === updatedUserData.id) {
         localStorage.setItem('exammaster_user', JSON.stringify(updatedUserData));
         setUser(updatedUserData);
      }
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const PageLayout = ({ children }) => {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, ROLES }}>
      <Router>
        <Routes>
          <Route path="/test" element={<TestPage />} />
          <Route path="/login" element={<PageLayout><LoginPage /></PageLayout>} />
          <Route path="/register" element={<PageLayout><RegisterPage /></PageLayout>} />
          <Route path="/forgot-password" element={<PageLayout><ForgotPasswordPage /></PageLayout>} />
          <Route path="/reset-password" element={<PageLayout><ResetPasswordPage /></PageLayout>} />
          
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]} />}>
            <Route path="/" element={<PageLayout><HomePage /></PageLayout>} />
            <Route path="/profile" element={<PageLayout><ProfilePage /></PageLayout>} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={<PageLayout><AdminDashboard /></PageLayout>} />
            <Route path="/admin/users" element={<PageLayout><UserManagementPage /></PageLayout>} />
            <Route path="/admin/questions" element={<PageLayout><QuestionManagementPage /></PageLayout>} />
            <Route path="/admin/exams" element={<PageLayout><ExamManagementPage /></PageLayout>} />
            <Route path="/admin/performance" element={<PageLayout><StudentPerformancePage /></PageLayout>} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.TEACHER]} />}>
            <Route path="/teacher/questions" element={<PageLayout><QuestionManagementPage /></PageLayout>} />
            <Route path="/teacher/exams" element={<PageLayout><ExamManagementPage /></PageLayout>} />
            <Route path="/teacher/performance" element={<PageLayout><StudentPerformancePage /></PageLayout>} />
          </Route>

          {/* Redirect /performance to role-specific performance page */}
          <Route path="/performance" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]}>
              {user?.role === ROLES.ADMIN ? (
                <Navigate to="/admin/performance" replace />
              ) : (
                <Navigate to="/teacher/performance" replace />
              )}
            </ProtectedRoute>
          } />
          
          <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
            <Route path="/student" element={<PageLayout><StudentDashboard /></PageLayout>} />
            <Route path="/student/exams" element={<PageLayout><AvailableExamsPage /></PageLayout>} />
            <Route path="/student/exam/:examId" element={<PageLayout><TakeExamPage /></PageLayout>} />
            <Route path="/student/results/:submissionId" element={<PageLayout><ExamResultsPage /></PageLayout>} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
  