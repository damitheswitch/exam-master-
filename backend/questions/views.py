from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Subject, Question
from .serializers import SubjectSerializer, QuestionSerializer, QuestionListSerializer
from accounts.permissions import IsTeacherOrAdmin

class SubjectListCreateView(generics.ListCreateAPIView):
    """List all subjects or create a new subject"""
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTeacherOrAdmin()]
        return [permissions.IsAuthenticated()]

class SubjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a subject"""
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsTeacherOrAdmin]

class QuestionListCreateView(generics.ListCreateAPIView):
    """List all questions or create a new question"""
    queryset = Question.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['subject', 'type', 'author']
    search_fields = ['text', 'subject__name']
    ordering_fields = ['created_at', 'points', 'subject__name']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return QuestionListSerializer
        return QuestionSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTeacherOrAdmin()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a question"""
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsTeacherOrAdmin]
    
    def get_queryset(self):
        # Teachers can only modify their own questions, admins can modify all
        if self.request.user.is_admin:
            return Question.objects.all()
        return Question.objects.filter(author=self.request.user) 