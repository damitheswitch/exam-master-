from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import ExamSubmission, StudentAnswer
from .serializers import (
    ExamSubmissionSerializer,
    SubmitExamSerializer,
    ExamResultSerializer,
    SubmissionListSerializer
)
from accounts.permissions import IsStudentUser, IsTeacherOrAdmin
from exams.models import Exam
from questions.models import Question

class SubmissionListView(generics.ListAPIView):
    """List all submissions (Teachers/Admins only)"""
    queryset = ExamSubmission.objects.all()
    serializer_class = SubmissionListSerializer
    permission_classes = [IsTeacherOrAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['exam', 'student', 'is_passed']
    search_fields = ['student__first_name', 'student__last_name', 'exam__title']
    ordering_fields = ['submit_time', 'score', 'percentage']
    ordering = ['-submit_time']
    
    def get_queryset(self):
        # Teachers can only see submissions for their exams, admins can see all
        if self.request.user.is_admin:
            return ExamSubmission.objects.all()
        return ExamSubmission.objects.filter(exam__created_by=self.request.user)

class SubmissionDetailView(generics.RetrieveAPIView):
    """Retrieve submission details"""
    queryset = ExamSubmission.objects.all()
    serializer_class = ExamSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return ExamSubmission.objects.all()
        elif user.is_teacher:
            return ExamSubmission.objects.filter(exam__created_by=user)
        else:  # student
            return ExamSubmission.objects.filter(student=user)

@api_view(['POST'])
@permission_classes([IsStudentUser])
def submit_exam(request):
    """Submit an exam with answers"""
    serializer = SubmitExamSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    exam_id = serializer.validated_data['exam_id']
    answers_data = serializer.validated_data['answers']
    tab_switches = serializer.validated_data.get('tab_switches', 0)
    
    try:
        exam = Exam.objects.get(id=exam_id, is_published=True)
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if student has already submitted this exam
    existing_submission = ExamSubmission.objects.filter(
        exam=exam, 
        student=request.user
    ).first()
    
    if existing_submission:
        return Response(
            {'error': 'You have already submitted this exam'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if exam is still available
    now = timezone.now()
    if not (exam.start_time <= now <= exam.end_time):
        return Response(
            {'error': 'Exam is no longer available'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    with transaction.atomic():
        # Create submission
        submission = ExamSubmission.objects.create(
            exam=exam,
            student=request.user,
            submit_time=now,
            tab_switches=tab_switches
        )
        
        # Process answers
        for question_id_str, selected_options in answers_data.items():
            try:
                question_id = int(question_id_str)
                question = Question.objects.get(id=question_id)
                
                # Ensure question is part of the exam
                if not exam.questions.filter(id=question_id).exists():
                    continue
                
                # Create student answer
                answer = StudentAnswer.objects.create(
                    submission=submission,
                    question=question,
                    selected_options=selected_options if isinstance(selected_options, list) else [selected_options]
                )
                
                # Check if answer is correct
                answer.check_answer()
                
            except (ValueError, Question.DoesNotExist):
                continue
        
        # Calculate final score
        result = submission.calculate_score()
        
        return Response({
            'submission_id': submission.id,
            'score': result['score'],
            'total_marks': result['total_marks'],
            'percentage': result['percentage'],
            'is_passed': result['is_passed'],
            'message': 'Exam submitted successfully'
        }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsStudentUser])
def student_results(request):
    """Get all exam results for the current student"""
    submissions = ExamSubmission.objects.filter(student=request.user)
    serializer = SubmissionListSerializer(submissions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def submission_result(request, pk):
    """Get detailed result for a specific submission"""
    try:
        submission = ExamSubmission.objects.get(pk=pk)
        
        # Check permissions
        if request.user.is_student and submission.student != request.user:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        elif request.user.is_teacher and submission.exam.created_by != request.user:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ExamResultSerializer(submission)
        return Response(serializer.data)
        
    except ExamSubmission.DoesNotExist:
        return Response(
            {'error': 'Submission not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )