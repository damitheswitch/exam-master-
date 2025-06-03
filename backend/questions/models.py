from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()

class Subject(models.Model):
    """Model for exam subjects"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']

class Question(models.Model):
    """Model for exam questions"""
    QUESTION_TYPES = (
        ('single-choice', 'Single Choice'),
        ('multiple-choice', 'Multiple Choice'),
    )
    
    text = models.TextField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='questions')
    type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    points = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='authored_questions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.text[:50]}... ({self.subject.name})"
    
    class Meta:
        ordering = ['-created_at']

class QuestionOption(models.Model):
    """Model for question answer options"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.text} ({'Correct' if self.is_correct else 'Incorrect'})"
    
    class Meta:
        ordering = ['order'] 