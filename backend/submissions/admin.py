from django.contrib import admin
from .models import ExamSubmission, StudentAnswer

class StudentAnswerInline(admin.TabularInline):
    model = StudentAnswer
    extra = 0
    readonly_fields = ('question', 'selected_options', 'is_correct', 'points_earned')
    can_delete = False

@admin.register(ExamSubmission)
class ExamSubmissionAdmin(admin.ModelAdmin):
    list_display = ('student', 'exam', 'submit_time', 'score', 'total_marks', 'percentage', 'is_passed')
    list_filter = ('is_passed', 'exam', 'submit_time')
    search_fields = ('student__first_name', 'student__last_name', 'exam__title')
    ordering = ('-submit_time',)
    readonly_fields = ('start_time', 'score', 'total_marks', 'percentage', 'is_passed')
    inlines = [StudentAnswerInline]

@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ('submission', 'question_preview', 'selected_options', 'is_correct', 'points_earned')
    list_filter = ('is_correct', 'question__type')
    search_fields = ('submission__student__first_name', 'submission__student__last_name', 'question__text')
    readonly_fields = ('is_correct', 'points_earned')
    
    def question_preview(self, obj):
        return obj.question.text[:50] + "..." if len(obj.question.text) > 50 else obj.question.text
    question_preview.short_description = 'Question' 