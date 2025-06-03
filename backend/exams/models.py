from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from questions.models import Question

User = get_user_model()

class Exam(models.Model):
    """Model for exams"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    duration = models.PositiveIntegerField(
        help_text="Duration in minutes",
        validators=[MinValueValidator(1), MaxValueValidator(600)]
    )
    total_marks = models.PositiveIntegerField(default=0)
    pass_percentage = models.PositiveIntegerField(
        default=50,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_published = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_exams')
    questions = models.ManyToManyField(Question, through='ExamQuestion')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    def calculate_total_marks(self):
        """Calculate total marks for the exam"""
        total = sum(eq.question.points for eq in self.exam_questions.all())
        self.total_marks = total
        self.save()
        return total
    
    @property
    def questions_count(self):
        return self.questions.count()
    
    class Meta:
        ordering = ['-created_at']

class ExamQuestion(models.Model):
    """Through model for Exam-Question relationship"""
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='exam_questions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        unique_together = ('exam', 'question')
        ordering = ['order']
    
    def __str__(self):
        return f"{self.exam.title} - {self.question.text[:30]}..." 