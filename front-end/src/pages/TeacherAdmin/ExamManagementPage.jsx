import React, { useState, useEffect, useContext } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Checkbox } from '@/components/ui/checkbox';
    import { useToast } from '@/components/ui/use-toast';
    import { AuthContext } from '@/App';
    import { PlusCircle, Edit, Trash2, Search, Eye, Shuffle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
    import ExamForm from '@/components/TeacherAdmin/ExamForm';
    import ViewQuestionsDialog from '@/components/TeacherAdmin/ViewQuestionsDialog';

    const ExamManagementPage = () => {
      const [exams, setExams] = useState([]);
      const [questions, setQuestions] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [isViewQuestionsDialogOpen, setIsViewQuestionsDialogOpen] = useState(false);
      const [viewingExamQuestions, setViewingExamQuestions] = useState([]);
      const [editingExam, setEditingExam] = useState(null);
      
      const { toast } = useToast();
      const { user } = useContext(AuthContext);

      useEffect(() => {
        const storedExams = JSON.parse(localStorage.getItem('exammaster_exams') || '[]');
        setExams(storedExams);
        const storedQuestions = JSON.parse(localStorage.getItem('exammaster_questions') || '[]');
        setQuestions(storedQuestions);
      }, []);

      const handleSearch = (event) => setSearchTerm(event.target.value.toLowerCase());

      const filteredExams = exams.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm) ||
        exam.subject.toLowerCase().includes(searchTerm)
      );

      const openDialog = (examToEdit = null) => {
        setEditingExam(examToEdit);
        setIsDialogOpen(true);
      };

      const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingExam(null);
      };

      const handleSubmit = (formData) => {
        console.log('ExamManagementPage: handleSubmit called with:', formData);
        console.log('ExamManagementPage: Validation check - Title:', formData.title, 'Subject:', formData.subject, 'Duration:', formData.duration, 'DateTime:', formData.scheduledDateTime, 'Questions:', formData.selectedQuestionIds.length);
        
        if (!formData.title || !formData.subject || formData.duration <= 0 || !formData.scheduledDateTime || formData.selectedQuestionIds.length === 0) {
          console.log('ExamManagementPage: Validation failed, showing error toast');
          toast({ variant: "destructive", title: "Error", description: "All fields are required, duration must be positive, and at least one question must be selected." });
          return;
        }
        
        console.log('ExamManagementPage: Validation passed, creating exam');

        let updatedExams;
        const examData = { 
            ...formData, 
            authorId: user.id, 
            scheduledDateTime: new Date(formData.scheduledDateTime).toISOString() 
        };

        if (editingExam) {
          updatedExams = exams.map(ex => ex.id === editingExam.id ? { ...ex, ...examData } : ex);
          toast({ title: "Exam Updated", description: `Exam "${formData.title}" has been updated.` });
        } else {
          const newExam = { id: Date.now().toString(), ...examData };
          updatedExams = [...exams, newExam];
          toast({ title: "Exam Created", description: `Exam "${formData.title}" has been created.` });
        }
        localStorage.setItem('exammaster_exams', JSON.stringify(updatedExams));
        setExams(updatedExams);
        closeDialog();
      };

      const handleDeleteExam = (examId) => {
        const updatedExams = exams.filter(ex => ex.id !== examId);
        localStorage.setItem('exammaster_exams', JSON.stringify(updatedExams));
        setExams(updatedExams);
        toast({ title: "Exam Deleted", description: "Exam has been removed." });
      };
      
      const handleTogglePublish = (examId) => {
        const updatedExams = exams.map(ex => 
          ex.id === examId ? { ...ex, published: !ex.published } : ex
        );
        localStorage.setItem('exammaster_exams', JSON.stringify(updatedExams));
        setExams(updatedExams);
        const exam = updatedExams.find(ex => ex.id === examId);
        toast({ title: `Exam ${exam.published ? 'Published' : 'Unpublished'}`, description: `Exam "${exam.title}" is now ${exam.published ? 'available' : 'hidden'}.` });
      };

      const openViewQuestionsDialog = (exam) => {
        const examQuestions = questions.filter(q => exam.selectedQuestionIds.includes(q.id));
        setViewingExamQuestions(examQuestions);
        setIsViewQuestionsDialogOpen(true);
      };

      const closeViewQuestionsDialog = () => {
        setIsViewQuestionsDialogOpen(false);
        setViewingExamQuestions([]);
      };
      
      const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } }};
      const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }};

      return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants}>
            <CardHeader className="px-0">
              <CardTitle className="text-3xl font-bold gradient-text">Exam Management</CardTitle>
              <CardDescription className="text-slate-400">Create, schedule, and publish exams.</CardDescription>
            </CardHeader>
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input type="text" placeholder="Search exams..." value={searchTerm} onChange={handleSearch} className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-primary" />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              if (!open) {
                closeDialog();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white">
                  <PlusCircle className="mr-2 h-5 w-5" /> Create New Exam
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl bg-slate-800 border-slate-700 text-slate-50">
                <DialogHeader>
                  <DialogTitle className="text-primary">{editingExam ? 'Edit Exam' : 'Create New Exam'}</DialogTitle>
                </DialogHeader>
                <ExamForm 
                  onSubmit={handleSubmit} 
                  initialData={editingExam} 
                  allQuestions={questions} 
                  onClose={closeDialog} 
                />
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800/70 border-slate-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-700/50">
                      <TableHead className="text-slate-300">Title</TableHead>
                      <TableHead className="text-slate-300">Subject</TableHead>
                      <TableHead className="text-slate-300">Questions</TableHead>
                      <TableHead className="text-slate-300">Duration</TableHead>
                      <TableHead className="text-slate-300">Scheduled</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-right text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExams.map((ex) => (
                      <TableRow key={ex.id} className="border-slate-700 hover:bg-slate-750/50">
                        <TableCell className="font-medium text-slate-100">{ex.title}</TableCell>
                        <TableCell className="text-slate-300">{ex.subject}</TableCell>
                        <TableCell className="text-slate-300">
                          {(ex.selectedQuestionIds && ex.selectedQuestionIds.length) || 0}
                          <Button variant="ghost" size="icon" onClick={() => openViewQuestionsDialog(ex)} className="ml-2 text-sky-400 hover:text-sky-300 h-6 w-6">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-slate-300">{ex.duration} min</TableCell>
                        <TableCell className="text-slate-300">{new Date(ex.scheduledDateTime).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button 
                            variant={ex.published ? "default" : "secondary"} 
                            size="sm" 
                            onClick={() => handleTogglePublish(ex.id)}
                            className={ex.published ? "bg-green-600 hover:bg-green-700" : "bg-slate-600 hover:bg-slate-500"}
                          >
                            {ex.published ? 'Published' : 'Draft'}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => openDialog(ex)} className="text-blue-400 hover:text-blue-300 hover:bg-slate-700">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-slate-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-800 border-slate-700 text-slate-50">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-400">Delete Exam?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  Are you sure you want to delete the exam "{ex.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="text-slate-300 border-slate-600 hover:bg-slate-700">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteExam(ex.id)} className="bg-destructive hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredExams.length === 0 && (
                  <p className="text-center py-8 text-slate-400">No exams found. Try creating one or adjusting filters.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <ViewQuestionsDialog 
            isOpen={isViewQuestionsDialogOpen} 
            onClose={closeViewQuestionsDialog} 
            questions={viewingExamQuestions} 
          />

        </motion.div>
      );
    };

    export default ExamManagementPage;