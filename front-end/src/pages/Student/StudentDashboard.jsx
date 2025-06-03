
    import React, { useContext, useEffect, useState } from 'react';
    import { Link } from 'react-router-dom';
    import { AuthContext } from '@/App';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { BookOpenCheck, CheckCircle, Clock, Award } from 'lucide-react';
    import { motion } from 'framer-motion';

    const StudentDashboard = () => {
      const { user } = useContext(AuthContext);
      const [stats, setStats] = useState({ availableExams: 0, completedExams: 0, averageScore: 0 });

      useEffect(() => {
        if (user) {
          const allExams = JSON.parse(localStorage.getItem('exammaster_exams') || '[]');
          const publishedExams = allExams.filter(exam => exam.published);
          
          const submissions = JSON.parse(localStorage.getItem('exammaster_submissions') || '[]');
          const userSubmissions = submissions.filter(sub => sub.studentId === user.id);
          
          const completedExamIds = userSubmissions.map(sub => sub.examId);
          const availableForStudent = publishedExams.filter(exam => !completedExamIds.includes(exam.id));

          let totalScore = 0;
          userSubmissions.forEach(sub => {
            totalScore += sub.scoreData.percentage;
          });
          const average = userSubmissions.length > 0 ? Math.round(totalScore / userSubmissions.length) : 0;

          setStats({
            availableExams: availableForStudent.length,
            completedExams: userSubmissions.length,
            averageScore: average,
          });
        }
      }, [user]);

      const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
      };

      const quickLinks = [
        { title: "Available Exams", description: "View and start your pending exams.", icon: <BookOpenCheck className="h-8 w-8 text-sky-400" />, link: "/student/exams", color: "sky" },
        { title: "My Results", description: "Check your scores on completed exams.", icon: <Award className="h-8 w-8 text-emerald-400" />, link: "/student/results/overview", color: "emerald" }, // Placeholder link
      ];

      return (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 }}}}
          className="space-y-8"
        >
          <motion.div variants={cardVariants}>
            <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2">Welcome, {user?.name}!</h1>
            <p className="text-slate-400">Your student dashboard for ExamMaster.</p>
          </motion.div>

          <motion.div variants={cardVariants} className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/70 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Available Exams</CardTitle>
                <Clock className="h-5 w-5 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-400">{stats.availableExams}</div>
                <p className="text-xs text-slate-400">Exams ready for you to take.</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/70 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Completed Exams</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">{stats.completedExams}</div>
                <p className="text-xs text-slate-400">Exams you have already finished.</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/70 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Average Score</CardTitle>
                <Award className="h-5 w-5 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">{stats.averageScore}%</div>
                <p className="text-xs text-slate-400">Your average performance.</p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {quickLinks.map((action, index) => (
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
                <CardTitle className="text-2xl text-rose-400">Recent Activity</CardTitle>
                <CardDescription className="text-slate-400">Summary of your recent exam activities (placeholder).</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">No recent activity to display yet.</p>
                <img  alt="Student studying at a desk with laptop and books" class="mt-4 rounded-lg opacity-80 shadow-lg" src="https://images.unsplash.com/photo-1606326608690-4e0281b1e588" />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      );
    };

    export default StudentDashboard;
  