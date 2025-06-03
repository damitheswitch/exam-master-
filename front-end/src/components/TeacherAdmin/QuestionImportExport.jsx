import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Download, Upload, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const QuestionImportExport = ({ questions, onQuestionsImported }) => {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const exportQuestions = () => {
    if (questions.length === 0) {
      toast({
        variant: "destructive",
        title: "No Questions to Export",
        description: "There are no questions available to export.",
      });
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      totalQuestions: questions.length,
      questions: questions.map(q => ({
        text: q.text,
        type: q.type,
        subject: q.subject,
        difficulty: q.difficulty,
        points: q.points || 1,
        options: q.options || [],
        explanation: q.explanation || ""
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `exammaster-questions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Questions Exported",
      description: `Successfully exported ${questions.length} questions.`,
    });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a JSON file.",
      });
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validate the JSON structure
        if (!importData.questions || !Array.isArray(importData.questions)) {
          throw new Error("Invalid JSON structure. Expected 'questions' array.");
        }

        // Validate each question
        const validatedQuestions = importData.questions.map((q, index) => {
          if (!q.text || !q.type || !q.subject) {
            throw new Error(`Question ${index + 1} is missing required fields (text, type, subject).`);
          }

          if (q.type === 'multiple-choice' && (!q.options || !Array.isArray(q.options) || q.options.length < 2)) {
            throw new Error(`Question ${index + 1} must have at least 2 options for multiple-choice type.`);
          }

          if (q.type === 'multiple-choice') {
            const hasCorrectAnswer = q.options.some(opt => opt.isCorrect);
            if (!hasCorrectAnswer) {
              throw new Error(`Question ${index + 1} must have at least one correct answer.`);
            }
          }

          return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            text: q.text,
            type: q.type,
            subject: q.subject.trim(),
            difficulty: q.difficulty || 'medium',
            points: q.points || 1,
            options: q.options || [],
            explanation: q.explanation || "",
            createdAt: new Date().toISOString(),
            authorId: 'imported'
          };
        });

        // Import the questions
        onQuestionsImported(validatedQuestions);
        
        toast({
          title: "Questions Imported Successfully",
          description: `Imported ${validatedQuestions.length} questions.`,
        });

      } catch (error) {
        console.error('Import error:', error);
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: error.message || "Failed to parse JSON file.",
        });
      } finally {
        setIsImporting(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "File Read Error",
        description: "Failed to read the selected file.",
      });
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  const downloadSampleFormat = () => {
    const sampleData = {
      exportDate: new Date().toISOString(),
      totalQuestions: 2,
      questions: [
        {
          text: "What is the capital of France?",
          type: "multiple-choice",
          subject: "Geography",
          difficulty: "easy",
          points: 1,
          options: [
            { text: "London", isCorrect: false },
            { text: "Paris", isCorrect: true },
            { text: "Berlin", isCorrect: false },
            { text: "Madrid", isCorrect: false }
          ],
          explanation: "Paris is the capital and largest city of France."
        },
        {
          text: "Explain the process of photosynthesis.",
          type: "essay",
          subject: "Biology",
          difficulty: "medium",
          points: 5,
          options: [],
          explanation: "Students should explain how plants convert light energy into chemical energy."
        }
      ]
    };

    const dataStr = JSON.stringify(sampleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'exammaster-questions-sample-format.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Sample Format Downloaded",
      description: "Use this file as a template for importing questions.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-slate-800/70 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <FileText className="mr-2 h-5 w-5" />
            Import/Export Questions
          </CardTitle>
          <CardDescription className="text-slate-400">
            Import questions from JSON files or export existing questions for backup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Section */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200">Export Questions</h4>
            <p className="text-sm text-slate-400">
              Download all questions as a JSON file for backup or sharing.
            </p>
            <Button
              onClick={exportQuestions}
              disabled={questions.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Questions ({questions.length})
            </Button>
          </div>

          {/* Import Section */}
          <div className="space-y-2 pt-4 border-t border-slate-600">
            <h4 className="font-semibold text-slate-200">Import Questions</h4>
            <p className="text-sm text-slate-400">
              Upload a JSON file containing questions to import them into the system.
            </p>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isImporting ? 'Importing...' : 'Import Questions'}
              </Button>
              <Button
                onClick={downloadSampleFormat}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Sample Format
              </Button>
            </div>
          </div>

          {/* Format Information */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-blue-400">JSON Format Requirements</h5>
                <ul className="text-sm text-slate-300 mt-1 space-y-1">
                  <li>• Each question must have: text, type, subject</li>
                  <li>• Multiple-choice questions need options array with isCorrect flags</li>
                  <li>• Supported types: "multiple-choice", "essay", "true-false"</li>
                  <li>• Optional fields: difficulty, points, explanation</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuestionImportExport; 