import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/App';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

const NewExamBadge = () => {
  const { user } = useContext(AuthContext);
  const [newExamsCount, setNewExamsCount] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'student') return;

    try {
      const checkForNewExams = () => {
        const allExams = JSON.parse(localStorage.getItem('exammaster_exams') || '[]');
        const lastLoginTime = localStorage.getItem(`exammaster_last_login_${user.id}`);
        
        // If no last login time, consider all published exams as new
        const lastLogin = lastLoginTime ? new Date(lastLoginTime) : new Date(0);
        
        const newExams = allExams.filter(exam => {
          const examCreated = new Date(exam.createdAt || new Date());
          return exam.published && examCreated > lastLogin;
        });

        setNewExamsCount(newExams.length);
      };

      checkForNewExams();
      
      // Update last login time
      localStorage.setItem(`exammaster_last_login_${user.id}`, new Date().toISOString());
    } catch (error) {
      console.error('Error in NewExamBadge:', error);
      setNewExamsCount(0);
    }
  }, [user]);

  if (newExamsCount === 0) return null;

  return (
    <Badge variant="destructive" className="ml-2 animate-pulse">
      <Bell className="w-3 h-3 mr-1" />
      {newExamsCount} New
    </Badge>
  );
};

export default NewExamBadge; 