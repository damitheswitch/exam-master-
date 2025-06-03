from django.contrib import admin
from .models import Exam, ExamQuestion

class ExamQuestionInline(admin.TabularInline):
    model = ExamQuestion
    extra = 1
    fields = ('question', 'order')

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('title', 'duration', 'total_marks', 'is_published', 'created_by', 'start_time', 'end_time')
    list_filter = ('is_published', 'created_by', 'start_time')
    search_fields = ('title', 'description', 'created_by__username')
    ordering = ('-created_at',)
    inlines = [ExamQuestionInline]
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new exam
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
        obj.calculate_total_marks()

@admin.register(ExamQuestion)
class ExamQuestionAdmin(admin.ModelAdmin):
    list_display = ('exam', 'question_preview', 'order')
    list_filter = ('exam', 'question__type')
    search_fields = ('exam__title', 'question__text')
    
    def question_preview(self, obj):
        return obj.question.text[:50] + "..." if len(obj.question.text) > 50 else obj.question.text
    question_preview.short_description = 'Question' 