import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Checkbox } from '@/components/ui/checkbox';
    import { DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { Shuffle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    const ExamForm = ({ onSubmit, initialData, allQuestions, onClose }) => {
      const [formData, setFormData] = useState({
        title: '',
        subject: '',
        duration: 60,
        scheduledDateTime: '',
        selectedQuestionIds: [],
        published: false,
      });
      const [numRandomQuestions, setNumRandomQuestions] = useState(5);
      const { toast } = useToast();

      useEffect(() => {
        if (initialData) {
          setFormData({
            title: initialData.title,
            subject: initialData.subject,
            duration: initialData.duration,
            scheduledDateTime: initialData.scheduledDateTime ? new Date(initialData.scheduledDateTime).toISOString().slice(0, 16) : '',
            selectedQuestionIds: [...initialData.selectedQuestionIds],
            published: initialData.published || false,
          });
        } else {
           setFormData({
            title: '',
            subject: '',
            duration: 60,
            scheduledDateTime: '',
            selectedQuestionIds: [],
            published: false,
          });
        }
      }, [initialData]);

      const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
      };

      const handleQuestionSelection = (questionId) => {
        setFormData(prev => {
          const newSelectedQuestionIds = prev.selectedQuestionIds.includes(questionId)
            ? prev.selectedQuestionIds.filter(id => id !== questionId)
            : [...prev.selectedQuestionIds, questionId];
          return { ...prev, selectedQuestionIds: newSelectedQuestionIds };
        });
      };

        const handleSelectRandomQuestions = (e) => {
    if (e) {
      e.preventDefault(); // Prevent form submission
      e.stopPropagation(); // Stop event bubbling
    }
    
    console.log('=== RANDOM SELECTION STARTED ===');
    console.log('Random selection clicked - Subject:', formData.subject);
    console.log('Available questions total:', allQuestions.length);
    console.log('Event object:', e);
    
    if (!formData.subject || formData.subject.trim() === '') {
      console.log('ERROR: No subject specified');
      alert('Please specify a subject to select random questions.');
      return;
    }
    
    const questionsInSubject = allQuestions.filter(q => 
      q.subject && q.subject.toLowerCase().trim() === formData.subject.toLowerCase().trim()
    );
    
    console.log('Questions in subject:', questionsInSubject.length);
    console.log('Questions found:', questionsInSubject.map(q => q.text));
    
    if (questionsInSubject.length === 0) {
      console.log('ERROR: No questions found for subject');
      alert(`No questions found for subject: "${formData.subject}". Please check your question bank.`);
      return;
    }
    
    if (numRandomQuestions > questionsInSubject.length) {
      console.log('ERROR: Not enough questions available');
      alert(`Only ${questionsInSubject.length} questions available for this subject. Requested ${numRandomQuestions}.`);
      return;
    }

    // Create a proper random shuffle using Fisher-Yates algorithm
    const shuffled = [...questionsInSubject];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const selected = shuffled.slice(0, numRandomQuestions).map(q => q.id);
    console.log('Selected question IDs:', selected);
    console.log('About to update form data...');
    
    setFormData(prev => {
      const newFormData = { ...prev, selectedQuestionIds: [...selected] };
      console.log('Form data updated successfully:', newFormData);
      return newFormData;
    });
    
    console.log('SUCCESS: Random selection completed successfully');
    // TODO: Re-enable toast once we confirm this isn't causing dialog closure
    // toast({ 
    //   title: "Random Questions Selected", 
    //   description: `${selected.length} questions selected randomly for subject "${formData.subject}".` 
    // });
    
    console.log('=== RANDOM SELECTION COMPLETED ===');
  };

      const availableQuestionsForSelection = allQuestions.filter(q => formData.subject ? q.subject.toLowerCase() === formData.subject.toLowerCase() : true);

      const handleSaveExam = () => {
        console.log('=== SAVE EXAM BUTTON CLICKED ===');
        console.log('ExamForm: Save button clicked with data:', formData);
        console.log('ExamForm: Selected questions count:', formData.selectedQuestionIds.length);
        console.log('Stack trace:', new Error().stack);
        onSubmit(formData);
      };



      return (
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-slate-300">Exam Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleFormChange} className="bg-slate-700 border-slate-600" />
              </div>
              <div>
                <Label htmlFor="subject" className="text-slate-300">Subject</Label>
                <Input id="subject" name="subject" value={formData.subject} onChange={handleFormChange} placeholder="e.g., Algebra Final" className="bg-slate-700 border-slate-600" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration" className="text-slate-300">Duration (minutes)</Label>
                <Input id="duration" name="duration" type="number" min="1" value={formData.duration} onChange={handleFormChange} className="bg-slate-700 border-slate-600" />
              </div>
              <div>
                <Label htmlFor="scheduledDateTime" className="text-slate-300">Scheduled Date & Time</Label>
                <Input id="scheduledDateTime" name="scheduledDateTime" type="datetime-local" value={formData.scheduledDateTime} onChange={handleFormChange} className="bg-slate-700 border-slate-600 text-slate-50 calendar-picker-indicator-invert" />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox id="published" name="published" checked={formData.published} onCheckedChange={(checked) => setFormData(prev => ({...prev, published: checked}))} />
              <Label htmlFor="published" className="text-slate-300">Publish Exam Immediately</Label>
            </div>
          </div>

          <div className="mt-4">
            <Label className="text-slate-300 block mb-2">Select Questions (Subject: {formData.subject || 'All'})</Label>
            <div className="flex items-center gap-2 mb-2">
              <Input 
                type="number" 
                min="1"
                value={numRandomQuestions} 
                onChange={(e) => setNumRandomQuestions(parseInt(e.target.value, 10))} 
                className="bg-slate-700 border-slate-600 w-24"
                placeholder="Num"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSelectRandomQuestions} 
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                <Shuffle className="mr-2 h-4 w-4" /> Select Random
              </Button>
            </div>
            <div className="max-h-60 overflow-y-auto border border-slate-700 rounded-md p-2 bg-slate-700/50">
              {availableQuestionsForSelection.length > 0 ? availableQuestionsForSelection.map(q => (
                <div key={q.id} className="flex items-center space-x-2 p-2 hover:bg-slate-600/50 rounded">
                  <Checkbox
                    id={`q-form-${q.id}`}
                    checked={formData.selectedQuestionIds.includes(q.id)}
                    onCheckedChange={() => handleQuestionSelection(q.id)}
                  />
                  <Label htmlFor={`q-form-${q.id}`} className="text-sm text-slate-200 flex-grow cursor-pointer">
                    {q.text.substring(0,100)}{q.text.length > 100 && '...'} ({q.points} pts)
                  </Label>
                </div>
              )) : <p className="text-slate-400 text-sm p-2">No questions found for this subject. Try adding questions or changing the exam subject.</p>}
            </div>
            <p className="text-sm text-slate-400 mt-1">{formData.selectedQuestionIds.length} questions selected.</p>
          </div>
          
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700" onClick={onClose}>Cancel</Button></DialogClose>
            <Button type="button" onClick={handleSaveExam} className="bg-primary hover:bg-primary/90">Save Exam</Button>
          </DialogFooter>
        </div>
      );
    };

    export default ExamForm;