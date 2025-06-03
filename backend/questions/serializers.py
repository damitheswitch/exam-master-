from rest_framework import serializers
from .models import Subject, Question, QuestionOption

class SubjectSerializer(serializers.ModelSerializer):
    """Serializer for Subject model"""
    questions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Subject
        fields = ['id', 'name', 'description', 'questions_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_questions_count(self, obj):
        return obj.questions.count()

class QuestionOptionSerializer(serializers.ModelSerializer):
    """Serializer for QuestionOption model"""
    
    class Meta:
        model = QuestionOption
        fields = ['id', 'text', 'is_correct', 'order']
        read_only_fields = ['id']

class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for Question model"""
    options = QuestionOptionSerializer(many=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'subject', 'subject_name', 'type', 'points', 
                 'options', 'author', 'author_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        options_data = validated_data.pop('options')
        question = Question.objects.create(**validated_data)
        
        for option_data in options_data:
            QuestionOption.objects.create(question=question, **option_data)
        
        return question
    
    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', None)
        
        # Update question fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update options if provided
        if options_data is not None:
            # Delete existing options
            instance.options.all().delete()
            
            # Create new options
            for option_data in options_data:
                QuestionOption.objects.create(question=instance, **option_data)
        
        return instance
    
    def validate_options(self, value):
        """Validate question options"""
        if len(value) < 2:
            raise serializers.ValidationError("Question must have at least 2 options")
        
        correct_options = [opt for opt in value if opt.get('is_correct', False)]
        
        if not correct_options:
            raise serializers.ValidationError("At least one option must be marked as correct")
        
        # For single choice questions, only one option should be correct
        question_type = self.initial_data.get('type')
        if question_type == 'single-choice' and len(correct_options) > 1:
            raise serializers.ValidationError("Single choice questions can only have one correct answer")
        
        return value

class QuestionListSerializer(serializers.ModelSerializer):
    """Simplified serializer for question lists"""
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    options_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'subject', 'subject_name', 'type', 'points', 
                 'options_count', 'author_name', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_options_count(self, obj):
        return obj.options.count() 