import React, { useState, useEffect, useContext } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { AuthContext } from '@/App';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { PlayCircle, Search, Info, Clock } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
    import { useToast } from '@/components/ui/use-toast';

    const AvailableExamsPage = () => {
      const [availableExams, setAvailableExams] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const { user } = useContext(AuthContext);
      const navigate = useNavigate();
      const { toast } = useToast();
      const [now, setNow] = useState(new Date());

      useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000); // Update 'now' every minute
        return () => clearInterval(timer);
      }, []);

      useEffect(() => {
        if (user) {
          const allExams = JSON.parse(localStorage.getItem('exammaster_exams') || '[]');
          const publishedExams = allExams.filter(exam => exam.published);
          
          const submissions = JSON.parse(localStorage.getItem('exammaster_submissions') || '[]');
          const userSubmissions = submissions.filter(sub => sub.studentId === user.id);
          const completedExamIds = userSubmissions.map(sub => sub.examId);

          const examsForStudent = publishedExams.filter(exam => !completedExamIds.includes(exam.id));
          setAvailableExams(examsForStudent);

          // Simulated notifications
          examsForStudent.forEach(exam => {
            const scheduledTime = new Date(exam.scheduledDateTime).getTime();
            const currentTime = new Date().getTime();
            const oneHourBefore = scheduledTime - 60 * 60 * 1000;
            const fiveMinutesBefore = scheduledTime - 5 * 60 * 1000;

            const notificationKeyPublished = `notif_published_${exam.id}`;
            const notificationKeyHour = `notif_hour_${exam.id}`;
            const notificationKeyFiveMin = `notif_fivemin_${exam.id}`;

            if (!localStorage.getItem(notificationKeyPublished)) {
              toast({
                title: "New Exam Published!",
                description: `Exam "${exam.title}" is now available. Scheduled for: ${new Date(exam.scheduledDateTime).toLocaleString()}`,
                duration: 10000,
              });
              localStorage.setItem(notificationKeyPublished, 'true');
            }
            
            if (currentTime >= oneHourBefore && currentTime < scheduledTime && !localStorage.getItem(notificationKeyHour)) {
              toast({
                title: "Exam Reminder: 1 Hour",
                description: `Exam "${exam.title}" starts in about an hour at ${new Date(exam.scheduledDateTime).toLocaleTimeString()}.`,
                duration: 10000,
              });
              localStorage.setItem(notificationKeyHour, 'true');
            }

            if (currentTime >= fiveMinutesBefore && currentTime < scheduledTime && !localStorage.getItem(notificationKeyFiveMin)) {
              toast({
                title: "Exam Reminder: 5 Minutes",
                description: `Exam "${exam.title}" is starting very soon at ${new Date(exam.scheduledDateTime).toLocaleTimeString()}! Get ready.`,
                duration: 10000,
              });
              localStorage.setItem(notificationKeyFiveMin, 'true');
            }
          });
        }
      }, [user, toast]);

      const handleSearch = (event) => setSearchTerm(event.target.value.toLowerCase());

      const filteredExams = availableExams.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm) ||
        exam.subject.toLowerCase().includes(searchTerm)
      );
      
      const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } }};
      const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }};

      const canStartExam = (examScheduledTime) => {
        return now.getTime() >= new Date(examScheduledTime).getTime();
      };

      return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants}>
            <CardHeader className="px-0">
              <CardTitle className="text-3xl font-bold gradient-text">Available Exams</CardTitle>
              <CardDescription className="text-slate-400">Here are the exams you can take. Good luck!</CardDescription>
            </CardHeader>
          </motion.div>

          <motion.div variants={itemVariants} className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search available exams..." 
              value={searchTerm} 
              onChange={handleSearch}
              className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-primary"
            />
          </motion.div>

          {filteredExams.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => {
                const isExamTime = canStartExam(exam.scheduledDateTime);
                return (
                  <motion.div variants={itemVariants} key={exam.id}>
                    <Card className={`bg-slate-800/70 border-slate-700 hover:shadow-primary/30 transition-shadow duration-300 flex flex-col h-full ${!isExamTime ? 'opacity-70' : ''}`}>
                      <CardHeader>
                        <CardTitle className="text-xl text-sky-400">{exam.title}</CardTitle>
                        <CardDescription className="text-slate-400">Subject: {exam.subject}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-slate-300"><Info className="inline mr-1 h-4 w-4 text-yellow-400" /> Duration: {exam.duration} minutes</p>
                        <p className="text-sm text-slate-300"><Info className="inline mr-1 h-4 w-4 text-yellow-400" /> Questions: {(exam.selectedQuestionIds && exam.selectedQuestionIds.length) || 0}</p>
                        <p className="text-sm text-slate-300"><Clock className="inline mr-1 h-4 w-4 text-yellow-400" /> Scheduled: {new Date(exam.scheduledDateTime).toLocaleString()}</p>
                        {!isExamTime && (
                          <p className="text-xs text-amber-400 mt-2">This exam is not yet open. It will be available at the scheduled time.</p>
                        )}
                      </CardContent>
                      <CardFooter>
                        {isExamTime ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-500/90 hover:to-emerald-600/90 text-white"
                              >
                                <PlayCircle className="mr-2 h-5 w-5" /> Start Exam
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-800 border-slate-700 text-slate-50">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-emerald-400">Ready to start "{exam.title}"?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  Once you start, the timer will begin. Ensure you have a stable internet connection and a quiet environment.
                                  <br /> <br />
                                  <strong>Important:</strong> Switching tabs or minimizing the browser window during the exam will be recorded and may affect your result.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="text-slate-300 border-slate-600 hover:bg-slate-700">Not yet</AlertDialogCancel>
                                <AlertDialogAction onClick={() => navigate(`/student/exam/${exam.id}`)} className="bg-emerald-500 hover:bg-emerald-600">
                                  Yes, start now!
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button 
                            className="w-full bg-slate-600 text-slate-400 cursor-not-allowed"
                            disabled={true}
                            onClick={() => {
                              const timeRemaining = new Date(exam.scheduledDateTime) - now;
                              const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                              const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                              toast({
                                variant: "destructive",
                                title: "Exam Not Available Yet",
                                description: `This exam will be available in ${hours}h ${minutes}m at ${new Date(exam.scheduledDateTime).toLocaleString()}`
                              });
                            }}
                          >
                            <Clock className="mr-2 h-5 w-5" /> Available {new Date(exam.scheduledDateTime).toLocaleString()}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div variants={itemVariants} className="text-center py-10">
              <img  alt="Empty desk with a single plant" className="mx-auto w-64 h-64 opacity-70 mb-4" src="https://images.unsplash.com/photo-1575380067530-f9011a5af3ec" />
              <p className="text-xl text-slate-400">No exams currently available for you.</p>
              <p className="text-sm text-slate-500">Check back later or contact your teacher if you expect an exam.</p>
            </motion.div>
          )}
        </motion.div>
      );
    };

    export default AvailableExamsPage;