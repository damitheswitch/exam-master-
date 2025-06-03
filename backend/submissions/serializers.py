from rest_framework import serializers
from django.utils import timezone
from .models import ExamSubmission, StudentAnswer
from questions.serializers import QuestionSerializer

class StudentAnswerSerializer(serializers.ModelSerializer):
    """Serializer for StudentAnswer model"""
    question = QuestionSerializer(read_only=True)
    question_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = StudentAnswer
        fields = ['id', 'question', 'question_id', 'selected_options', 'is_correct', 'points_earned']
        read_only_fields = ['id', 'is_correct', 'points_earned']

class ExamSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for ExamSubmission model"""
    answers = StudentAnswerSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    
    class Meta:
        model = ExamSubmission
        fields = [
            'id', 'exam', 'exam_title', 'student', 'student_name', 'start_time', 
            'submit_time', 'score', 'total_marks', 'percentage', 'is_passed', 
            'tab_switches', 'answers'
        ]
        read_only_fields = [
            'id', 'student', 'start_time', 'score', 'total_marks', 
            'percentage', 'is_passed'
        ]

class SubmitExamSerializer(serializers.Serializer):
    """Serializer for exam submission"""
    exam_id = serializers.IntegerField()
    answers = serializers.DictField(
        child=serializers.ListField(child=serializers.CharField(), allow_empty=True),
        help_text="Dictionary with question_id as key and list of selected options as value"
    )
    tab_switches = serializers.IntegerField(default=0)
    
    def validate_exam_id(self, value):
        from exams.models import Exam
        try:
            exam = Exam.objects.get(id=value, is_published=True)
            # Check if exam is currently available
            now = timezone.now()
            if not (exam.start_time <= now <= exam.end_time):
                raise serializers.ValidationError("Exam is not currently available")
            return value
        except Exam.DoesNotExist:
            raise serializers.ValidationError("Exam not found or not published")

class ExamResultSerializer(serializers.ModelSerializer):
    """Serializer for exam results"""
    answers = StudentAnswerSerializer(many=True, read_only=True)
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    exam_duration = serializers.IntegerField(source='exam.duration', read_only=True)
    exam_pass_percentage = serializers.IntegerField(source='exam.pass_percentage', read_only=True)
    
    class Meta:
        model = ExamSubmission
        fields = [
            'id', 'exam_title', 'exam_duration', 'exam_pass_percentage',
            'start_time', 'submit_time', 'score', 'total_marks', 
            'percentage', 'is_passed', 'tab_switches', 'answers'
        ]

class SubmissionListSerializer(serializers.ModelSerializer):
    """Simplified serializer for submission lists"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    
    class Meta:
        model = ExamSubmission
        fields = [
            'id', 'exam_title', 'student_name', 'submit_time', 
            'score', 'total_marks', 'percentage', 'is_passed'
        ]