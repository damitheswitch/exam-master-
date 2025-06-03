from rest_framework import serializers
from django.utils import timezone
from .models import Exam, ExamQuestion
from questions.serializers import QuestionSerializer

class ExamQuestionSerializer(serializers.ModelSerializer):
    """Serializer for ExamQuestion model"""
    question = QuestionSerializer(read_only=True)
    question_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ExamQuestion
        fields = ['id', 'question', 'question_id', 'order']

class ExamSerializer(serializers.ModelSerializer):
    """Serializer for Exam model"""
    exam_questions = ExamQuestionSerializer(many=True, read_only=True)
    question_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'description', 'duration', 'total_marks', 'pass_percentage',
            'start_time', 'end_time', 'is_published', 'created_by', 'created_by_name',
            'questions_count', 'exam_questions', 'question_ids', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'total_marks', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate exam data"""
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        if start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError("End time must be after start time")
            
            if start_time < timezone.now():
                raise serializers.ValidationError("Start time cannot be in the past")
        
        return data
    
    def create(self, validated_data):
        question_ids = validated_data.pop('question_ids', [])
        exam = Exam.objects.create(**validated_data)
        
        # Add questions to exam
        for i, question_id in enumerate(question_ids):
            ExamQuestion.objects.create(
                exam=exam,
                question_id=question_id,
                order=i + 1
            )
        
        # Calculate total marks
        exam.calculate_total_marks()
        return exam
    
    def update(self, instance, validated_data):
        question_ids = validated_data.pop('question_ids', None)
        
        # Update exam fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update questions if provided
        if question_ids is not None:
            # Remove existing questions
            instance.exam_questions.all().delete()
            
            # Add new questions
            for i, question_id in enumerate(question_ids):
                ExamQuestion.objects.create(
                    exam=instance,
                    question_id=question_id,
                    order=i + 1
                )
            
            # Recalculate total marks
            instance.calculate_total_marks()
        
        return instance

class ExamListSerializer(serializers.ModelSerializer):
    """Simplified serializer for exam lists"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'description', 'duration', 'total_marks',
            'start_time', 'end_time', 'is_published', 'created_by_name',
            'questions_count', 'created_at'
        ]

class StudentExamSerializer(serializers.ModelSerializer):
    """Serializer for students viewing available exams"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_available = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'description', 'duration', 'total_marks',
            'start_time', 'end_time', 'created_by_name', 'questions_count',
            'is_available', 'time_remaining'
        ]
    
    def get_is_available(self, obj):
        now = timezone.now()
        return obj.is_published and obj.start_time <= now <= obj.end_time
    
    def get_time_remaining(self, obj):
        now = timezone.now()
        if obj.end_time > now:
            remaining = obj.end_time - now
            return int(remaining.total_seconds())
        return 0

class ExamTakeSerializer(serializers.ModelSerializer):
    """Serializer for taking an exam (includes questions)"""
    exam_questions = ExamQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'description', 'duration', 'total_marks',
            'start_time', 'end_time', 'exam_questions'
        ] 