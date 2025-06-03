import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

console.log('=== TAKE EXAM PAGE MODULE LOADED ===');
import { AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; 
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const TakeExamPage = () => {
  console.log('=== TAKE EXAM PAGE COMPONENT INITIALIZED ===');
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  // State declarations
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTabSwitchWarningOpen, setIsTabSwitchWarningOpen] = useState(false);
  const [isTimeUpAlertOpen, setIsTimeUpAlertOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // Memoized calculation of exam score
  const calculateScore = useCallback(() => {
    let score = 0;
    let totalPossibleScore = 0;
  
    questions.forEach(q => {
      totalPossibleScore += (q.points || 1);
      const studentAnswer = answers[q.id];
      const correctOptions = q.options.filter(opt => opt.isCorrect).map(opt => opt.text);
  
      if (q.type === 'single-choice') {
        if (studentAnswer && correctOptions.includes(studentAnswer)) {
          score += (q.points || 1);
        }
      } else if (q.type === 'multiple-choice') {
        if (studentAnswer && studentAnswer.length > 0) {
          const sortedStudentAnswers = [...studentAnswer].sort();
          const sortedCorrectOptions = [...correctOptions].sort();
          if (JSON.stringify(sortedStudentAnswers) === JSON.stringify(sortedCorrectOptions)) {
            score += (q.points || 1);
          }
        }
      }
    });
    const percentage = totalPossibleScore > 0 ? Math.round((score / totalPossibleScore) * 100) : 0;
    return { score, totalPossibleScore, percentage };
  }, [questions, answers]);

  // Handle exam submission
  const submitExam = useCallback(async () => {
    if (isSubmitting || !exam) return;

    setIsSubmitting(true);
    console.log('Submitting exam...');
    
    try {
      const scoreData = calculateScore();
      const submission = {
        id: `sub_${Date.now()}`,
        examId,
        studentId: user?.id || 'unknown',
        studentName: user?.name || 'Unknown Student',
        answers,
        submittedAt: new Date().toISOString(),
        timeSpent: (exam.duration * 60) - timeLeft,
        tabSwitchCount,
        score: scoreData.percentage,
        scoreData,
        examTitle: exam.title
      };
      
      const submissions = JSON.parse(localStorage.getItem('exammaster_submissions') || '[]');
      submissions.push(submission);
      localStorage.setItem('exammaster_submissions', JSON.stringify(submissions));
      
      toast({
        title: "Exam Submitted",
        description: `Your exam has been submitted successfully! Score: ${scoreData.percentage}%`,
      });
      
      navigate(`/student/results/${submission.id}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit exam. Please try again.",
      });
      setIsSubmitting(false);
    }
  }, [exam, answers, timeLeft, tabSwitchCount, user, examId, navigate, toast, calculateScore, isSubmitting]);

  useEffect(() => {
    console.log('=== TAKE EXAM PAGE USEEFFECT TRIGGERED ===');
    console.log('User ID:', user?.id);
    console.log('Exam ID from params:', examId);
    
    if (!user?.id || !examId) {
      console.log('ERROR: Missing user or examId - user:', user, 'examId:', examId);
      return;
    }

    console.log('Loading exam data from localStorage...');
    const allExams = JSON.parse(localStorage.getItem('exammaster_exams') || '[]');
    console.log('All exams loaded:', allExams.length);
    
    const currentExam = allExams.find(ex => ex.id === examId);
    console.log('TakeExamPage: Found exam:', currentExam);

    if (!currentExam) {
      toast({ variant: "destructive", title: "Error", description: "Exam not found." });
      navigate('/student/exams');
      return;
    }

    if (!currentExam.published) {
      toast({ variant: "destructive", title: "Error", description: "Exam is not published yet." });
      navigate('/student/exams');
      return;
    }
    
    // Check if the exam time has arrived
    const now = new Date();
    const examScheduledTime = new Date(currentExam.scheduledDateTime);
    
    if (now < examScheduledTime) {
      toast({ 
        variant: "destructive", 
        title: "Exam Not Yet Available", 
        description: `This exam is scheduled for ${examScheduledTime.toLocaleString()}. Please wait until the scheduled time.` 
      });
      navigate('/student/exams');
      return;
    }
    
    const submissions = JSON.parse(localStorage.getItem('exammaster_submissions') || '[]');
    const existingSubmission = submissions.find(sub => sub.examId === examId && sub.studentId === user.id);
    if (existingSubmission) {
        toast({ title: "Exam Already Taken", description: "You have already submitted this exam." });
        navigate(`/student/results/${existingSubmission.id}`);
        return;
    }

    const allQuestions = JSON.parse(localStorage.getItem('exammaster_questions') || '[]');
    const examQuestions = allQuestions.filter(q => currentExam.selectedQuestionIds && currentExam.selectedQuestionIds.includes(q.id));
    
    console.log('TakeExamPage: Selected questions:', examQuestions.length);

    if (examQuestions.length === 0) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "No questions found for this exam. Please contact your teacher." 
      });
      navigate('/student/exams');
      return;
    }

    setExam(currentExam);
    setTimeLeft(currentExam.duration * 60);
    setQuestions(examQuestions);

    const initialAnswers = {};
    examQuestions.forEach(q => {
      initialAnswers[q.id] = q.type === 'multiple-choice' ? [] : '';
    });
    setAnswers(initialAnswers);

  }, [examId, navigate, toast, user?.id]);

  useEffect(() => {
    if (timeLeft <= 0 && exam) { 
      if (!isSubmitting) { 
        setIsTimeUpAlertOpen(true);
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, exam, isSubmitting]);
  
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && timeLeft > 0 && !isSubmitting) {
      const newCount = tabSwitchCount + 1;
      setTabSwitchCount(newCount);
      
      if (newCount >= 3) {
        toast({
          variant: "destructive",
          title: "Exam Auto-Submitted",
          description: "Too many tab switches detected. Your exam has been automatically submitted.",
          duration: 10000,
        });
        
        // Auto-submit the exam after 2 seconds
        setTimeout(() => {
          if (!isSubmitting) {
            submitExam();
          }
        }, 2000);
      } else {
        setIsTabSwitchWarningOpen(true);
        toast({
          variant: "destructive",
          title: "Warning: Tab Switch Detected",
          description: `Warning ${newCount}/3: Please stay on this tab. After 3 warnings, your exam will be auto-submitted.`,
          duration: 10000,
        });
      }
    }
  }, [timeLeft, toast, isSubmitting, tabSwitchCount, submitExam]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  const handleAnswerChange = (questionId, value, questionType) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      if (questionType === 'multiple-choice') {
        const currentSelection = newAnswers[questionId] || [];
        if (currentSelection.includes(value)) {
          newAnswers[questionId] = currentSelection.filter(v => v !== value);
        } else {
          newAnswers[questionId] = [...currentSelection, value];
        }
      } else { 
        newAnswers[questionId] = value;
      }
      return newAnswers;
    });
  };

  useEffect(() => {
    if (isTimeUpAlertOpen && !isSubmitting) {
       submitExam();
    }
  }, [isTimeUpAlertOpen, submitExam, isSubmitting]);

  console.log('TakeExamPage render - exam:', exam, 'questions.length:', questions.length);
  
  if (!exam || questions.length === 0) {
    console.log('TakeExamPage: Showing loading state');
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-slate-300">Loading exam...</p>
        <p className="text-sm text-slate-500 mt-2">If this takes too long, please check if the exam is available at the scheduled time.</p>
        <p className="text-xs text-slate-600 mt-4">Debug: User={user?.id}, ExamId={examId}, Exam={!!exam}, Questions={questions.length}</p>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const questionVariants = {
    enter: (directionParam) => ({
      x: directionParam > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (directionParam) => ({
      zIndex: 0,
      x: directionParam < 0 ? 300 : -300,
      opacity: 0
    })
  };
  
  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentQuestionIndex(prev => Math.max(0, Math.min(questions.length - 1, prev + newDirection)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50">
      {/* Timer and Progress Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-400" />
              <span className="text-lg sm:text-xl font-semibold">{formatTime(timeLeft)}</span>
            </div>
            <div className="w-full sm:w-64 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000"
                style={{ width: `${(timeLeft / (exam?.duration * 60)) * 100}%` }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm sm:text-base">Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="bg-slate-800/70 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                  {questions[currentQuestionIndex]?.text}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {questions[currentQuestionIndex]?.type === 'multiple-choice' ? 'Select all that apply' : 'Select one answer'}
                  {questions[currentQuestionIndex]?.points > 1 && ` (${questions[currentQuestionIndex]?.points} points)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {questions[currentQuestionIndex]?.type === 'multiple-choice' ? (
                  <div className="space-y-3">
                    {questions[currentQuestionIndex]?.options.map((option, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <Checkbox
                          id={`option-${index}`}
                          checked={(answers[questions[currentQuestionIndex]?.id] || []).includes(option.text)}
                          onCheckedChange={() => handleAnswerChange(questions[currentQuestionIndex]?.id, option.text, 'multiple-choice')}
                          className="mt-1"
                        />
                        <Label htmlFor={`option-${index}`} className="text-base sm:text-lg cursor-pointer">
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <RadioGroup
                    value={answers[questions[currentQuestionIndex]?.id] || ''}
                    onValueChange={(value) => handleAnswerChange(questions[currentQuestionIndex]?.id, value, 'single-choice')}
                    className="space-y-3"
                  >
                    {questions[currentQuestionIndex]?.options.map((option, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <RadioGroupItem value={option.text} id={`option-${index}`} className="mt-1" />
                        <Label htmlFor={`option-${index}`} className="text-base sm:text-lg cursor-pointer">
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 space-x-4">
              <Button
                variant="outline"
                onClick={() => paginate(-1)}
                disabled={currentQuestionIndex === 0}
                className="flex-1 sm:flex-none"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => paginate(1)}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex-1 sm:flex-none"
              >
                Next
              </Button>
              <AlertDialog open={isTimeUpAlertOpen} onOpenChange={setIsTimeUpAlertOpen}>
                <AlertDialogContent className="bg-slate-800 border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl">Time's Up!</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      Your exam time has expired. Your answers will be submitted automatically.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction onClick={submitExam} className="bg-primary hover:bg-primary/90">
                      Submit Exam
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md shadow-lg py-4">
        <div className="container mx-auto px-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-800 border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl">Submit Exam?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Are you sure you want to submit your exam? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={submitExam} className="bg-emerald-600 hover:bg-emerald-700">
                  Submit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <AlertDialog open={isTabSwitchWarningOpen} onOpenChange={setIsTabSwitchWarningOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-slate-50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-yellow-400 flex items-center"><AlertTriangle className="mr-2" /> Tab Switch Detected</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              You have switched away from the exam tab. Please remain on this page to avoid issues with your exam. Further tab switches may be penalized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsTabSwitchWarningOpen(false)} className="bg-yellow-500 hover:bg-yellow-600">I Understand</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TakeExamPage;
  