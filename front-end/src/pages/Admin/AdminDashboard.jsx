
    import React from 'react';
    import { Link } from 'react-router-dom';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Users, Edit3, FileText, BarChart3, Settings } from 'lucide-react';
    import { motion } from 'framer-motion';

    const AdminDashboard = () => {
      const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
      };

      const actions = [
        { title: "User Management", description: "View, add, edit, or remove users.", icon: <Users className="h-8 w-8 text-sky-400" />, link: "/admin/users", color: "sky" },
        { title: "Question Bank", description: "Manage subjects and questions for exams.", icon: <Edit3 className="h-8 w-8 text-emerald-400" />, link: "/admin/questions", color: "emerald" },
        { title: "Exam Management", description: "Create, schedule, and publish exams.", icon: <FileText className="h-8 w-8 text-amber-400" />, link: "/admin/exams", color: "amber" },
      ];

      return (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 }}}}
          className="space-y-8"
        >
          <motion.div variants={cardVariants}>
            <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Oversee and manage all aspects of the ExamMaster platform.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actions.map((action, index) => (
              <motion.div key={index} variants={cardVariants}>
                <Card className={`bg-slate-800/70 border-slate-700 hover:shadow-${action.color}-500/30 transition-all duration-300 hover:border-${action.color}-500`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-xl font-semibold text-${action.color}-400`}>{action.title}</CardTitle>
                    {action.icon}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-400 mb-4">{action.description}</p>
                    <Button asChild variant="outline" className={`w-full border-${action.color}-500 text-${action.color}-400 hover:bg-${action.color}-500 hover:text-slate-900`}>
                      <Link to={action.link}>Go to {action.title}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <motion.div variants={cardVariants}>
            <Card className="bg-slate-800/70 border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl text-rose-400">Platform Overview</CardTitle>
                <CardDescription className="text-slate-400">Quick statistics about the platform (placeholders for now).</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-3xl font-bold text-slate-100">{(JSON.parse(localStorage.getItem('exammaster_users') || '[]')).length}</p>
                  <p className="text-sm text-slate-400">Total Users</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-3xl font-bold text-slate-100">{(JSON.parse(localStorage.getItem('exammaster_questions') || '[]')).length}</p>
                  <p className="text-sm text-slate-400">Total Questions</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-3xl font-bold text-slate-100">{(JSON.parse(localStorage.getItem('exammaster_exams') || '[]')).length}</p>
                  <p className="text-sm text-slate-400">Total Exams</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      );
    };

    export default AdminDashboard;
  