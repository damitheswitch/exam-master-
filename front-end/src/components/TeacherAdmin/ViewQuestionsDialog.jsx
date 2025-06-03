import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

    const ViewQuestionsDialog = ({ isOpen, onClose, questions }) => {
      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-slate-50">
            <DialogHeader>
              <DialogTitle className="text-primary">Exam Questions</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto space-y-3 p-1">
              {questions.length > 0 ? questions.map((q, index) => (
                <div key={q.id} className="p-3 border border-slate-700 rounded-md bg-slate-700/50">
                  <p className="font-semibold text-slate-200">Q{index+1}: {q.text} ({q.points} pts)</p>
                  <ul className="list-disc list-inside pl-4 mt-1 text-sm">
                    {q.options.map((opt, i) => (
                      <li key={i} className={`${opt.isCorrect ? 'text-green-400 font-medium' : 'text-slate-300'}`}>
                        {opt.text} {opt.isCorrect ? '(Correct)' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )) : <p className="text-slate-400">No questions in this exam.</p>}
            </div>
            <DialogFooter>
              <Button onClick={onClose} variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default ViewQuestionsDialog;