import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Percent, Award, ListChecks, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ExamResultsPage = () => {
  const { submissionId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);

  useEffect(() => {
    if (user && submissionId) {
      const allSubmissions = JSON.parse(localStorage.getItem('exammaster_submissions') || '[]');
      const currentSubmission = allSubmissions.find(sub => sub.id === submissionId && sub.studentId === user.id);

      if (!currentSubmission) {
        navigate('/student/exams'); 
        return;
      }
      setSubmission(currentSubmission);

      const allQuestions = JSON.parse(localStorage.getItem('exammaster_questions') || '[]');
      const exam = JSON.parse(localStorage.getItem('exammaster_exams') || '[]').find(ex => ex.id === currentSubmission.examId);
      if (exam) {
        const questionsForExam = allQuestions.filter(q => exam.selectedQuestionIds.includes(q.id));
        setExamQuestions(questionsForExam);
      }
    }
  }, [submissionId, user, navigate]);

  if (!submission) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-slate-300">Loading results...</p>
      </div>
    );
  }

  const getAnswerStatus = (question) => {
    const studentAnswer = submission.answers[question.id];
    const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.text);

    if (question.type === 'single-choice') {
      return studentAnswer && correctOptions.includes(studentAnswer);
    } else if (question.type === 'multiple-choice') {
      if (!studentAnswer || studentAnswer.length === 0) return false;
      const sortedStudentAnswers = [...studentAnswer].sort();
      const sortedCorrectOptions = [...correctOptions].sort();
      return JSON.stringify(sortedStudentAnswers) === JSON.stringify(sortedCorrectOptions);
    }
    return false;
  };
  
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.3 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 }}}}
      className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-4 sm:space-y-6"
    >
      <motion.div variants={cardVariants}>
        <Button onClick={() => navigate('/student/exams')} variant="outline" className="mb-4 sm:mb-6 text-slate-300 border-slate-600 hover:bg-slate-700">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exams
        </Button>
        <Card className="bg-slate-800/70 border-slate-700 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-primary/30 via-slate-800/50 to-slate-800/50 p-4 sm:p-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-50">Exam Results: <span className="gradient-text">{submission.examTitle}</span></CardTitle>
            <CardDescription className="text-sm sm:text-base text-slate-400">Submitted on: {new Date(submission.submittedAt).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="p-3 sm:p-4 bg-slate-700/50 rounded-lg text-center shadow-md">
                <Award className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-yellow-400">{submission.scoreData.score}</p>
                <p className="text-xs sm:text-sm text-slate-400">Correct Answers</p>
              </div>
              <div className="p-3 sm:p-4 bg-slate-700/50 rounded-lg text-center shadow-md">
                <ListChecks className="h-8 w-8 sm:h-10 sm:w-10 text-sky-400 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-sky-400">{submission.scoreData.totalPossibleScore}</p>
                <p className="text-xs sm:text-sm text-slate-400">Total Questions Points</p>
              </div>
              <div className="p-3 sm:p-4 bg-slate-700/50 rounded-lg text-center shadow-md">
                <Percent className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{submission.scoreData.percentage}%</p>
                <p className="text-xs sm:text-sm text-slate-400">Overall Percentage</p>
              </div>
            </motion.div>

            <Tabs defaultValue="review" className="w-full">
              <TabsList className="grid w-full grid-cols-1 bg-slate-700 mb-4">
                <TabsTrigger value="review" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm sm:text-base py-2 sm:py-3">Review Your Answers</TabsTrigger>
              </TabsList>
              <TabsContent value="review">
                <div className="space-y-4 sm:space-y-6 max-h-[50vh] overflow-y-auto p-2 rounded-md border border-slate-700 bg-slate-900/30">
                  {examQuestions.map((question, index) => {
                    const isCorrect = getAnswerStatus(question);
                    const studentAnswer = submission.answers[question.id];
                    return (
                      <motion.div variants={itemVariants} key={question.id} className={`p-3 sm:p-4 rounded-lg border ${isCorrect ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-sm sm:text-base text-slate-200">Q{index + 1}: {question.text} <span className="text-xs text-slate-400">({question.points || 1} pts)</span></p>
                          {isCorrect ? <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 flex-shrink-0 ml-2" /> : <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 flex-shrink-0 ml-2" />}
                        </div>
                        <div className="text-xs sm:text-sm space-y-1">
                          <p className="text-slate-400">Your answer:
                            <span className="font-medium text-slate-200 ml-1">
                              {Array.isArray(studentAnswer) ? studentAnswer.join(', ') || 'Not answered' : studentAnswer || 'Not answered'}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-slate-400">Correct answer(s):
                              <span className="font-medium text-green-300 ml-1">
                                {question.options.filter(opt => opt.isCorrect).map(opt => opt.text).join(', ')}
                              </span>
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="p-4 sm:p-6 bg-slate-800/30 border-t border-slate-700">
            <p className="text-xs sm:text-sm text-slate-400">
              If you have any questions about your results, please contact your teacher or administrator.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ExamResultsPage;
  