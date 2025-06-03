from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Exam
from .serializers import (
    ExamSerializer, 
    ExamListSerializer, 
    StudentExamSerializer,
    ExamTakeSerializer
)
from accounts.permissions import IsTeacherOrAdmin, IsStudentUser

class ExamListCreateView(generics.ListCreateAPIView):
    """List all exams or create a new exam (Teachers/Admins only)"""
    queryset = Exam.objects.all()
    permission_classes = [IsTeacherOrAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_published', 'created_by']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_time', 'title']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ExamListSerializer
        return ExamSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ExamDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an exam (Teachers/Admins only)"""
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsTeacherOrAdmin]
    
    def get_queryset(self):
        # Teachers can only modify their own exams, admins can modify all
        if self.request.user.is_admin:
            return Exam.objects.all()
        return Exam.objects.filter(created_by=self.request.user)

class StudentExamListView(generics.ListAPIView):
    """List available exams for students"""
    serializer_class = StudentExamSerializer
    permission_classes = [IsStudentUser]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['start_time', 'title']
    ordering = ['start_time']
    
    def get_queryset(self):
        # Only show published exams
        return Exam.objects.filter(is_published=True)

@api_view(['GET'])
@permission_classes([IsStudentUser])
def exam_detail_for_student(request, pk):
    """Get exam details for a student (without answers)"""
    try:
        exam = Exam.objects.get(pk=pk, is_published=True)
        
        # Check if exam is available
        now = timezone.now()
        if not (exam.start_time <= now <= exam.end_time):
            return Response(
                {'error': 'Exam is not currently available'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ExamTakeSerializer(exam)
        return Response(serializer.data)
    
    except Exam.DoesNotExist:
        return Response(
            {'error': 'Exam not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsTeacherOrAdmin])
def publish_exam(request, pk):
    """Publish an exam"""
    try:
        exam = Exam.objects.get(pk=pk)
        
        # Check permissions
        if not request.user.is_admin and exam.created_by != request.user:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        exam.is_published = True
        exam.save()
        
        return Response({'message': 'Exam published successfully'})
    
    except Exam.DoesNotExist:
        return Response(
            {'error': 'Exam not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsTeacherOrAdmin])
def unpublish_exam(request, pk):
    """Unpublish an exam"""
    try:
        exam = Exam.objects.get(pk=pk)
        
        # Check permissions
        if not request.user.is_admin and exam.created_by != request.user:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        exam.is_published = False
        exam.save()
        
        return Response({'message': 'Exam unpublished successfully'})
    
    except Exam.DoesNotExist:
        return Response(
            {'error': 'Exam not found'}, 
            status=status.HTTP_404_NOT_FOUND
        ) 