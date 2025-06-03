// Test data for ExamMaster application
export const testUsers = [
  {
    id: 'test-teacher-1',
    name: 'John Teacher',
    email: 'teacher@test.com',
    password: 'password123',
    role: 'teacher'
  },
  {
    id: 'test-admin-1',
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: 'test-student-1',
    name: 'Alice Student',
    email: 'alice@test.com',
    password: 'student123',
    role: 'student'
  },
  {
    id: 'test-student-2',
    name: 'Bob Student',
    email: 'bob@test.com',
    password: 'student123',
    role: 'student'
  },
  {
    id: 'test-student-3',
    name: 'Charlie Student',
    email: 'charlie@test.com',
    password: 'student123',
    role: 'student'
  }
];

export const testExams = [
  {
    id: 'exam-1',
    title: 'Mathematics Quiz',
    subject: 'Mathematics',
    authorId: 'test-teacher-1',
    duration: 30,
    questions: [
      {
        id: 'q1',
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What is 5 × 3?',
        options: ['12', '15', '18', '20'],
        correctAnswer: 1
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'exam-2',
    title: 'Science Test',
    subject: 'Science',
    authorId: 'test-teacher-1',
    duration: 45,
    questions: [
      {
        id: 'q3',
        question: 'What is the chemical symbol for water?',
        options: ['H2O', 'CO2', 'O2', 'H2'],
        correctAnswer: 0
      }
    ],
    createdAt: new Date().toISOString()
  }
];

export const testSubmissions = [
  {
    id: 'sub-1',
    examId: 'exam-1',
    studentId: 'test-student-1',
    studentName: 'Alice Student',
    answers: [1, 1], // Both correct
    score: 100,
    totalQuestions: 2,
    timeSpent: 25,
    submittedAt: new Date().toISOString(),
    tabSwitches: 0,
    scoreData: {
      score: 2,
      totalPossibleScore: 2,
      percentage: 100
    }
  },
  {
    id: 'sub-2',
    examId: 'exam-1',
    studentId: 'test-student-2',
    studentName: 'Bob Student',
    answers: [1, 0], // One correct, one wrong
    score: 50,
    totalQuestions: 2,
    timeSpent: 28,
    submittedAt: new Date().toISOString(),
    tabSwitches: 2,
    scoreData: {
      score: 1,
      totalPossibleScore: 2,
      percentage: 50
    }
  },
  {
    id: 'sub-3',
    examId: 'exam-2',
    studentId: 'test-student-1',
    studentName: 'Alice Student',
    answers: [0], // Correct
    score: 100,
    totalQuestions: 1,
    timeSpent: 15,
    submittedAt: new Date().toISOString(),
    tabSwitches: 1,
    scoreData: {
      score: 1,
      totalPossibleScore: 1,
      percentage: 100
    }
  }
];

// Function to initialize test data
export const initializeTestData = () => {
  // Only initialize if no data exists
  if (!localStorage.getItem('exammaster_users')) {
    localStorage.setItem('exammaster_users', JSON.stringify(testUsers));
  }
  
  if (!localStorage.getItem('exammaster_exams')) {
    localStorage.setItem('exammaster_exams', JSON.stringify(testExams));
  }
  
  if (!localStorage.getItem('exammaster_submissions')) {
    localStorage.setItem('exammaster_submissions', JSON.stringify(testSubmissions));
  }
  
  console.log('Test data initialized');
}; 
 