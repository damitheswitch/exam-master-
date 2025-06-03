import React, { useState, useEffect, useContext } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { AuthContext } from '@/App';
    import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
    import QuestionForm from '@/components/TeacherAdmin/QuestionForm';
import QuestionImportExport from '@/components/TeacherAdmin/QuestionImportExport'; 

    const QUESTION_TYPES = {
      SINGLE_CHOICE: 'single-choice',
      MULTIPLE_CHOICE: 'multiple-choice',
    };

    const QuestionManagementPage = () => {
      const [questions, setQuestions] = useState([]);
      const [subjects, setSubjects] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [filterSubject, setFilterSubject] = useState('');
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [editingQuestion, setEditingQuestion] = useState(null);
      
      const { toast } = useToast();
      const { user } = useContext(AuthContext);

      useEffect(() => {
        const storedQuestions = JSON.parse(localStorage.getItem('exammaster_questions') || '[]');
        setQuestions(storedQuestions);
        const uniqueSubjects = [...new Set(storedQuestions.map(q => q.subject))].filter(Boolean);
        setSubjects(uniqueSubjects);
      }, []);

      const handleSearch = (event) => setSearchTerm(event.target.value.toLowerCase());
      const handleFilterSubject = (value) => setFilterSubject(value === 'all' ? '' : value);

      const filteredQuestions = questions.filter(q =>
        (q.text.toLowerCase().includes(searchTerm) || q.subject.toLowerCase().includes(searchTerm)) &&
        (filterSubject ? q.subject === filterSubject : true)
      );

      const openDialog = (questionToEdit = null) => {
        setEditingQuestion(questionToEdit);
        setIsDialogOpen(true);
      };

      const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingQuestion(null);
      };

      const handleSubmit = (formData) => {
        if (!formData.text || !formData.subject || !formData.type || formData.options.some(opt => !opt.text) || formData.points <= 0) {
          toast({ variant: "destructive", title: "Error", description: "All fields are required and points must be positive." });
          return;
        }
        if (!formData.options.some(opt => opt.isCorrect)) {
          toast({ variant: "destructive", title: "Error", description: "At least one option must be marked as correct." });
          return;
        }
        if (formData.type === QUESTION_TYPES.SINGLE_CHOICE && formData.options.filter(opt => opt.isCorrect).length > 1) {
          toast({ variant: "destructive", title: "Error", description: "Single-choice questions can only have one correct answer." });
          return;
        }

        let updatedQuestions;
        const newQuestionData = { ...formData, authorId: user.id };

        if (editingQuestion) {
          updatedQuestions = questions.map(q => q.id === editingQuestion.id ? { ...q, ...newQuestionData } : q);
          toast({ title: "Question Updated", description: "Question details have been updated." });
        } else {
          const newQuestion = { id: Date.now().toString(), ...newQuestionData };
          updatedQuestions = [...questions, newQuestion];
          toast({ title: "Question Added", description: "New question has been added to the bank." });
        }
        localStorage.setItem('exammaster_questions', JSON.stringify(updatedQuestions));
        setQuestions(updatedQuestions);
        const uniqueSubjects = [...new Set(updatedQuestions.map(q => q.subject))].filter(Boolean);
        setSubjects(uniqueSubjects);
        closeDialog();
      };

      const handleDeleteQuestion = (questionId) => {
        const updatedQuestions = questions.filter(q => q.id !== questionId);
        localStorage.setItem('exammaster_questions', JSON.stringify(updatedQuestions));
        setQuestions(updatedQuestions);
        const uniqueSubjects = [...new Set(updatedQuestions.map(q => q.subject))].filter(Boolean);
        setSubjects(uniqueSubjects);
        toast({ title: "Question Deleted", description: "Question has been removed from the bank." });
      };

      const handleQuestionsImported = (importedQuestions) => {
        // Filter out duplicate questions based on text and subject to avoid true duplicates
        const existingQuestionKeys = new Set(questions.map(q => `${q.text.trim()}_${q.subject.trim()}`));
        const newQuestions = importedQuestions.filter(q => 
          !existingQuestionKeys.has(`${q.text.trim()}_${q.subject.trim()}`)
        );
        
        const updatedQuestions = [...questions, ...newQuestions];
        localStorage.setItem('exammaster_questions', JSON.stringify(updatedQuestions));
        setQuestions(updatedQuestions);
        const uniqueSubjects = [...new Set(updatedQuestions.map(q => q.subject))].filter(Boolean);
        setSubjects(uniqueSubjects);
        
        // Show feedback about import results
        if (newQuestions.length !== importedQuestions.length) {
          const duplicatesCount = importedQuestions.length - newQuestions.length;
          toast({ 
            title: "Questions Imported with Duplicates Skipped", 
            description: `Imported ${newQuestions.length} new questions. Skipped ${duplicatesCount} duplicates.` 
          });
        }
      };
      
      const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } }};
      const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }};

      return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants}>
            <CardHeader className="px-0">
              <CardTitle className="text-3xl font-bold gradient-text">Question Bank</CardTitle>
              <CardDescription className="text-slate-400">Manage all questions for exams.</CardDescription>
            </CardHeader>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input type="text" placeholder="Search questions..." value={searchTerm} onChange={handleSearch} className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-primary" />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Select onValueChange={handleFilterSubject} value={filterSubject}>
                <SelectTrigger className="w-full md:w-[180px] bg-slate-700 border-slate-600 text-slate-50 focus:ring-primary">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-slate-50">
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                </SelectContent>
              </Select>
              <QuestionForm 
                isOpen={isDialogOpen} 
                onClose={closeDialog} 
                onSubmit={handleSubmit} 
                initialData={editingQuestion}
                questionTypes={QUESTION_TYPES}
              />
              <Button onClick={() => openDialog()} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white w-full md:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Question
              </Button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800/70 border-slate-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-700/50">
                      <TableHead className="text-slate-300 w-[50%]">Question Text</TableHead>
                      <TableHead className="text-slate-300">Subject</TableHead>
                      <TableHead className="text-slate-300">Type</TableHead>
                      <TableHead className="text-slate-300">Points</TableHead>
                      <TableHead className="text-right text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((q) => (
                      <TableRow key={q.id} className="border-slate-700 hover:bg-slate-750/50">
                        <TableCell className="font-medium text-slate-100 truncate max-w-xs">{q.text}</TableCell>
                        <TableCell className="text-slate-300">{q.subject}</TableCell>
                        <TableCell className="text-slate-300 capitalize">{q.type.replace('-', ' ')}</TableCell>
                        <TableCell className="text-slate-300">{q.points}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => openDialog(q)} className="text-blue-400 hover:text-blue-300 hover:bg-slate-700">
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
                                <AlertDialogTitle className="text-red-400">Delete Question?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  Are you sure you want to delete this question? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="text-slate-300 border-slate-600 hover:bg-slate-700">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteQuestion(q.id)} className="bg-destructive hover:bg-destructive/90">
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
                {filteredQuestions.length === 0 && (
                  <p className="text-center py-8 text-slate-400">No questions found. Try adding some or adjusting filters.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuestionImportExport 
              questions={questions} 
              onQuestionsImported={handleQuestionsImported} 
            />
          </motion.div>
        </motion.div>
      );
    };

    export default QuestionManagementPage;