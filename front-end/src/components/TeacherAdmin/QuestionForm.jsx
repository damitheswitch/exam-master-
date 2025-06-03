import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Checkbox } from '@/components/ui/checkbox';
    import { useToast } from '@/components/ui/use-toast';
    import { X } from 'lucide-react';

    const QuestionForm = ({ isOpen, onClose, onSubmit, initialData, questionTypes }) => {
      const [formData, setFormData] = useState({
        text: '',
        subject: '',
        type: questionTypes.SINGLE_CHOICE,
        options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
        points: 1,
      });
      const { toast } = useToast();

      useEffect(() => {
        if (initialData) {
          setFormData({
            text: initialData.text,
            subject: initialData.subject,
            type: initialData.type,
            options: JSON.parse(JSON.stringify(initialData.options)),
            points: initialData.points || 1,
          });
        } else {
          setFormData({
            text: '',
            subject: '',
            type: questionTypes.SINGLE_CHOICE,
            options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
            points: 1,
          });
        }
      }, [initialData, questionTypes]);

      const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleOptionChange = (index, field, value) => {
        const newOptions = [...formData.options];
        newOptions[index][field] = value;
        if (formData.type === questionTypes.SINGLE_CHOICE && field === 'isCorrect' && value === true) {
          newOptions.forEach((opt, i) => { if (i !== index) opt.isCorrect = false; });
        }
        setFormData(prev => ({ ...prev, options: newOptions }));
      };

      const addOption = () => {
        setFormData(prev => ({ ...prev, options: [...prev.options, { text: '', isCorrect: false }] }));
      };

      const removeOption = (index) => {
        if (formData.options.length <= 2) {
          toast({ variant: "destructive", title: "Error", description: "A question must have at least two options." });
          return;
        }
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, options: newOptions }));
      };
      
      const handleQuestionTypeChange = (value) => {
        const newOptions = formData.options.map(opt => ({ ...opt, isCorrect: false }));
        setFormData(prev => ({ ...prev, type: value, options: newOptions }));
      };

      const localSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
      };

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-slate-50">
            <DialogHeader>
              <DialogTitle className="text-primary">{initialData ? 'Edit Question' : 'Add New Question'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={localSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <Label htmlFor="q-form-text" className="text-slate-300">Question Text</Label>
                <Textarea id="q-form-text" name="text" value={formData.text} onChange={handleFormChange} className="bg-slate-700 border-slate-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="q-form-subject" className="text-slate-300">Subject</Label>
                  <Input id="q-form-subject" name="subject" value={formData.subject} onChange={handleFormChange} placeholder="e.g., Mathematics" className="bg-slate-700 border-slate-600" />
                </div>
                <div>
                  <Label htmlFor="q-form-type" className="text-slate-300">Question Type</Label>
                  <Select name="type" onValueChange={handleQuestionTypeChange} value={formData.type}>
                    <SelectTrigger id="q-form-type" className="bg-slate-700 border-slate-600"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-slate-50">
                      <SelectItem value={questionTypes.SINGLE_CHOICE}>Single Choice</SelectItem>
                      <SelectItem value={questionTypes.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="q-form-points" className="text-slate-300">Points</Label>
                <Input id="q-form-points" name="points" type="number" min="1" value={formData.points} onChange={handleFormChange} className="bg-slate-700 border-slate-600" />
              </div>
              <div>
                <Label className="text-slate-300">Options</Label>
                {formData.options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2 p-2 border border-slate-700 rounded-md">
                    <Checkbox id={`q-form-option-correct-${index}`} checked={opt.isCorrect} onCheckedChange={(checked) => handleOptionChange(index, 'isCorrect', checked)} />
                    <Label htmlFor={`q-form-option-correct-${index}`} className="sr-only">Correct</Label>
                    <Input type="text" placeholder={`Option ${index + 1}`} value={opt.text} onChange={(e) => handleOptionChange(index, 'text', e.target.value)} className="flex-grow bg-slate-600 border-slate-500" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)} className="text-red-400 hover:text-red-300" disabled={formData.options.length <= 2}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addOption} className="mt-2 text-slate-300 border-slate-600 hover:bg-slate-700">Add Option</Button>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700" onClick={onClose}>Cancel</Button></DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90">Save Question</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };

    export default QuestionForm;