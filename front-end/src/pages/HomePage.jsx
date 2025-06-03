import React, { useContext } from 'react';
import { AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen, Users, Edit } from 'lucide-react';

const HomePage = () => {
  const { user, ROLES } = useContext(AuthContext);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const renderRoleSpecificContent = () => {
    if (!user) return null;

    switch (user.role) {
      case ROLES.ADMIN:
        return (
          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-slate-800/70 border-slate-700 hover:shadow-primary/30 transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-sky-400"><Users className="mr-2" /> User Management</CardTitle>
                <CardDescription className="text-slate-400">Manage all users in the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="border-sky-400 text-sky-400 hover:bg-sky-400 hover:text-slate-900">
                  <Link to="/admin/users">Go to Users <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/70 border-slate-700 hover:shadow-primary/30 transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-400"><Edit className="mr-2" /> Question Bank</CardTitle>
                <CardDescription className="text-slate-400">Create and manage exam questions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-slate-900">
                  <Link to="/admin/questions">Manage Questions <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/70 border-slate-700 hover:shadow-primary/30 transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-amber-400"><BookOpen className="mr-2" /> Exam Creation</CardTitle>
                <CardDescription className="text-slate-400">Design and publish exams.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900">
                  <Link to="/admin/exams">Manage Exams <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      case ROLES.TEACHER:
        return (
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6 mt-8">
            <Card className="bg-slate-800/70 border-slate-700 hover:shadow-primary/30 transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-400"><Edit className="mr-2" /> Question Bank</CardTitle>
                <CardDescription className="text-slate-400">Create and manage exam questions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-slate-900">
                  <Link to="/teacher/questions">Manage Questions <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/70 border-slate-700 hover:shadow-primary/30 transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-amber-400"><BookOpen className="mr-2" /> Exam Creation</CardTitle>
                <CardDescription className="text-slate-400">Design and publish exams.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900">
                  <Link to="/teacher/exams">Manage Exams <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      case ROLES.STUDENT:
        return (
          <motion.div variants={itemVariants} className="grid md:grid-cols-1 gap-6 mt-8">
            <Card className="bg-slate-800/70 border-slate-700 hover:shadow-primary/30 transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-rose-400"><BookOpen className="mr-2" /> Available Exams</CardTitle>
                <CardDescription className="text-slate-400">View and take your scheduled exams.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-slate-900">
                  <Link to="/student/exams">View Exams <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center py-8 sm:py-12 px-4 sm:px-6"
    >
      <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6">
        Welcome to <span className="gradient-text">ExamMaster</span>
      </motion.h1>
      <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-300 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
        Your comprehensive platform for online examinations. Manage users, create questions, conduct exams, and track progress seamlessly.
      </motion.p>
      
      {!user && (
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button size="lg" asChild className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
            <Link to="/login">Login</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
            <Link to="/register">Register</Link>
          </Button>
        </motion.div>
      )}

      {user && (
        <motion.div variants={itemVariants} className="px-4">
          <p className="text-xl sm:text-2xl text-slate-200 mb-3 sm:mb-4">Hello, <span className="font-semibold text-primary">{user.name}</span>! ({user.role})</p>
          <p className="text-slate-400">What would you like to do today?</p>
        </motion.div>
      )}

      {renderRoleSpecificContent()}

      <motion.div variants={itemVariants} className="mt-12 sm:mt-16 p-4 sm:p-8 bg-slate-800/50 rounded-xl shadow-2xl max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-slate-100">Why Choose ExamMaster?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-left">
          <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/70">
            <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">Role-Based Access</h3>
            <p className="text-slate-400 text-sm sm:text-base">Dedicated dashboards and functionalities for Admins, Teachers, and Students.</p>
          </div>
          <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/70">
            <h3 className="text-lg sm:text-xl font-semibold text-accent mb-2">Flexible Question Types</h3>
            <p className="text-slate-400 text-sm sm:text-base">Support for single-choice and multiple-choice questions to suit various assessment needs.</p>
          </div>
          <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/70">
            <h3 className="text-lg sm:text-xl font-semibold text-purple-500 mb-2">Secure & Fair Exams</h3>
            <p className="text-slate-400 text-sm sm:text-base">Features like countdown timers and tab-switch warnings to maintain exam integrity.</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="mt-8 sm:mt-12 px-4">
        <img  
          alt="Abstract representation of online learning and examination" 
          className="w-full max-w-3xl mx-auto rounded-lg shadow-xl opacity-70"
          src="https://images.unsplash.com/photo-1608600712992-03e5325d94c8" />
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
  