from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from exams.models import Exam
from questions.models import Question

User = get_user_model()

class ExamSubmission(models.Model):
    """Model for exam submissions"""
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_submissions')
    start_time = models.DateTimeField(auto_now_add=True)
    submit_time = models.DateTimeField()
    score = models.PositiveIntegerField(default=0)
    total_marks = models.PositiveIntegerField(default=0)
    percentage = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)]
    )
    is_passed = models.BooleanField(default=False)
    tab_switches = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.exam.title}"
    
    def calculate_score(self):
        """Calculate the score for this submission"""
        total_score = 0
        total_possible = 0
        
        for answer in self.answers.all():
            total_possible += answer.question.points
            if answer.is_correct:
                total_score += answer.question.points
        
        self.score = total_score
        self.total_marks = total_possible
        self.percentage = (total_score / total_possible * 100) if total_possible > 0 else 0
        self.is_passed = self.percentage >= self.exam.pass_percentage
        self.save()
        
        return {
            'score': self.score,
            'total_marks': self.total_marks,
            'percentage': self.percentage,
            'is_passed': self.is_passed
        }
    
    class Meta:
        unique_together = ('exam', 'student')
        ordering = ['-submit_time']

class StudentAnswer(models.Model):
    """Model for individual student answers"""
    submission = models.ForeignKey(ExamSubmission, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_options = models.JSONField(default=list)  # Store selected option texts
    is_correct = models.BooleanField(default=False)
    points_earned = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.submission.student.get_full_name()} - {self.question.text[:30]}..."
    
    def check_answer(self):
        """Check if the answer is correct and calculate points"""
        correct_options = [opt.text for opt in self.question.options.filter(is_correct=True)]
        
        if self.question.type == 'single-choice':
            # For single choice, check if the selected option is correct
            if len(self.selected_options) == 1 and self.selected_options[0] in correct_options:
                self.is_correct = True
                self.points_earned = self.question.points
            else:
                self.is_correct = False
                self.points_earned = 0
        
        elif self.question.type == 'multiple-choice':
            # For multiple choice, all correct options must be selected and no incorrect ones
            selected_set = set(self.selected_options)
            correct_set = set(correct_options)
            
            if selected_set == correct_set:
                self.is_correct = True
                self.points_earned = self.question.points
            else:
                self.is_correct = False
                self.points_earned = 0
        
        self.save()
        return self.is_correct
    
    class Meta:
        unique_together = ('submission', 'question')
        ordering = ['question__id'] 