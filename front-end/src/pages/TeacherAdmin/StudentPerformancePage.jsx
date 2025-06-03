import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/App';

console.log('=== STUDENT PERFORMANCE PAGE MODULE LOADED ===');
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Users, Award, AlertTriangle, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const StudentPerformancePage = () => {
  console.log('=== STUDENT PERFORMANCE PAGE COMPONENT INITIALIZED ===');
  const { user } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState(() => {
    // Initialize with empty array and ensure it's always an array
    try {
      const data = JSON.parse(localStorage.getItem('exammaster_exams') || '[]');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error parsing exams from localStorage:', error);
      return [];
    }
  });
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExam, setFilterExam] = useState(undefined);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('=== PERFORMANCE PAGE USEEFFECT TRIGGERED ===');
    console.log('User object:', user);
    
    if (!user) {
      setError('No user data available. Please log in again.');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        console.log('Loading data from localStorage...');
        // Load data from localStorage with error handling
        const loadFromLocalStorage = (key, defaultValue = []) => {
          try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
          } catch (error) {
            console.error(`Error parsing ${key}:`, error);
            return defaultValue;
          }
        };

        const allSubmissions = loadFromLocalStorage('exammaster_submissions', []);
        const allExams = loadFromLocalStorage('exammaster_exams', []);
        const allUsers = loadFromLocalStorage('exammaster_users', []);
        
        console.log('Performance page raw data:', { allSubmissions, allExams, allUsers, user });
        
        // Ensure allExams is an array before filtering
        const teacherExams = Array.isArray(allExams)
          ? allExams.filter(
              exam =>
                exam &&
                ((exam.teacherId && exam.teacherId === user.id) ||
                 (exam.authorId && exam.authorId === user.id))
            )
          : [];
        
        const teacherExamIds = new Set(teacherExams.map(exam => exam.id));
        
        const teacherSubmissions = Array.isArray(allSubmissions)
          ? allSubmissions.filter(submission => submission && teacherExamIds.has(submission.examId))
          : [];
        
        // Get unique student IDs from submissions
        const studentIds = [...new Set(
          teacherSubmissions
            .filter(sub => sub && sub.studentId)
            .map(sub => sub.studentId)
        )];
        
        // Get student data
        const submissionStudents = Array.isArray(allUsers)
          ? allUsers.filter(user => 
              user && user.id && user.role === 'student' && studentIds.includes(user.id)
            )
          : [];
        
        console.log('Filtered data:', { teacherExams, teacherSubmissions, submissionStudents });
        
        setExams(teacherExams);
        setStudents(submissionStudents);
        setSubmissions(teacherSubmissions);
        
      } catch (error) {
        console.error('Error loading performance data:', error);
        setError('Failed to load performance data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const filteredSubmissions = submissions.filter(sub => {
    const exam = exams.find(e => e.id === sub.examId);
    const matchesSearch = sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exam && exam.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesExam = filterExam ? sub.examId === filterExam : true;
    return matchesSearch && matchesExam;
  });

  const calculateStats = () => {
    if (submissions.length === 0) return { avgScore: 0, totalSubmissions: 0, passRate: 0, avgTabSwitches: 0 };
    
    const totalScore = submissions.reduce((sum, sub) => {
      // Handle both old and new data structures
      const score = sub.scoreData?.percentage || sub.score || 0;
      return sum + score;
    }, 0);
    
    const passedSubmissions = submissions.filter(sub => {
      const score = sub.scoreData?.percentage || sub.score || 0;
      return score >= 60;
    }).length;
    
    const totalTabSwitches = submissions.reduce((sum, sub) => sum + (sub.tabSwitches || sub.tabSwitchCount || 0), 0);
    
    return {
      avgScore: Math.round(totalScore / submissions.length),
      totalSubmissions: submissions.length,
      passRate: Math.round((passedSubmissions / submissions.length) * 100),
      avgTabSwitches: Math.round(totalTabSwitches / submissions.length * 10) / 10
    };
  };

  const openDetailDialog = (submission) => {
    setSelectedSubmission(submission);
    setIsDetailDialogOpen(true);
  };

  const stats = calculateStats();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  console.log('Performance page render - loading:', loading, 'error:', error, 'user:', user);
  
  if (loading || !user) {
    console.log('Performance page: Showing loading state', { loading, user });
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-300">Loading performance data...</p>
        <div className="text-xs text-slate-500 text-center">
          <p>User: {user ? 'Authenticated' : 'Not authenticated'}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center p-6 bg-slate-800/50 rounded-lg max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-red-400 text-xl font-semibold mb-2">Error Loading Data</h3>
          <p className="text-slate-300 mb-4">There was a problem loading the performance data.</p>
          <p className="text-sm text-slate-500 mb-6">{error.message || 'Unknown error occurred'}</p>
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              className="bg-slate-700 hover:bg-slate-600"
            >
              Retry
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-slate-300 hover:bg-slate-700"
            >
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold gradient-text">Student Performance Analytics</CardTitle>
          <CardDescription className="text-slate-400">
            Monitor student progress and exam performance
          </CardDescription>
        </CardHeader>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/70 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Submissions</CardTitle>
            <Users className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{stats.totalSubmissions}</div>
            <p className="text-xs text-slate-400">Across all exams</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/70 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Average Score</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{stats.avgScore}%</div>
            <p className="text-xs text-slate-400">Overall performance</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/70 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Pass Rate</CardTitle>
            <Award className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">{stats.passRate}%</div>
            <p className="text-xs text-slate-400">Students passing (≥60%)</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/70 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Tab Switches</CardTitle>
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">{stats.avgTabSwitches}</div>
            <p className="text-xs text-slate-400">Per exam attempt</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by student name or exam title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-primary"
          />
        </div>
        <Select 
          onValueChange={(value) => setFilterExam(value === 'all' ? undefined : value)} 
          value={filterExam || 'all'}
        >
          <SelectTrigger className="w-full md:w-[200px] bg-slate-700 border-slate-600 text-slate-50 focus:ring-primary">
            <SelectValue placeholder="Filter by exam" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600 text-slate-50">
            <SelectItem value="all">All Exams</SelectItem>
            {Array.isArray(exams) && exams
              .filter(exam => exam && exam.id && typeof exam.id === 'string' && exam.id.trim() !== '')
              .map(exam => (
                <SelectItem 
                  key={exam.id} 
                  value={exam.id}
                >
                  {exam.title || 'Untitled Exam'}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Submissions Table */}
      <motion.div variants={itemVariants}>
        <Card className="bg-slate-800/70 border-slate-700">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-300">Student</TableHead>
                  <TableHead className="text-slate-300">Exam</TableHead>
                  <TableHead className="text-slate-300">Score</TableHead>
                  <TableHead className="text-slate-300">Percentage</TableHead>
                  <TableHead className="text-slate-300">Tab Switches</TableHead>
                  <TableHead className="text-slate-300">Submitted</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-right text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => {
                  const exam = exams.find(e => e.id === submission.examId);
                  const score = submission.scoreData?.percentage || submission.score || 0;
                  const passed = score >= 60;
                  const tabSwitches = submission.tabSwitches || submission.tabSwitchCount || 0;
                  const highTabSwitches = tabSwitches > 3;
                  
                  return (
                    <TableRow key={submission.id} className="border-slate-700 hover:bg-slate-750/50">
                      <TableCell className="font-medium text-slate-100">
                        {submission.studentName}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {exam ? exam.title : 'Unknown Exam'}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {submission.scoreData?.score || submission.correctAnswers || 0}/{submission.scoreData?.totalPossibleScore || submission.totalQuestions || 0}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <span className={passed ? 'text-green-400' : 'text-red-400'}>
                          {score}%
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <span className={highTabSwitches ? 'text-yellow-400' : 'text-slate-300'}>
                          {tabSwitches}
                          {highTabSwitches && <AlertTriangle className="inline ml-1 h-4 w-4" />}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={passed ? "default" : "destructive"}>
                          {passed ? 'Passed' : 'Failed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDetailDialog(submission)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredSubmissions.length === 0 && (
              <p className="text-center py-8 text-slate-400">
                No submissions found. Students haven't taken any exams yet.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl bg-slate-800 border-slate-700 text-slate-50">
          <DialogHeader>
            <DialogTitle className="text-primary">Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-200">Student Information</h4>
                  <p className="text-slate-300">Name: {selectedSubmission.studentName}</p>
                  <p className="text-slate-300">Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">Performance</h4>
                  <p className="text-slate-300">Score: {(selectedSubmission.scoreData?.score ?? 0)}/{(selectedSubmission.scoreData?.totalPossibleScore ?? 0)}</p>
                  <p className="text-slate-300">Percentage: {(selectedSubmission.scoreData?.percentage ?? 0)}%</p>
                  <p className="text-slate-300">Tab Switches: {selectedSubmission.tabSwitchCount ?? selectedSubmission.tabSwitches ?? 0}</p>
                </div>
              </div>
              
              {((selectedSubmission.tabSwitchCount ?? selectedSubmission.tabSwitches ?? 0) > 0) && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                    <h4 className="font-semibold text-yellow-400">Academic Integrity Alert</h4>
                  </div>
                  <p className="text-slate-300 mt-1">
                    This student switched tabs {(selectedSubmission.tabSwitchCount ?? selectedSubmission.tabSwitches ?? 0)} time(s) during the exam, 
                    which may indicate potential academic dishonesty.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default StudentPerformancePage; 