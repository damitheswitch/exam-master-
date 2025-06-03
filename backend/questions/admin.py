from django.contrib import admin
from .models import Subject, Question, QuestionOption

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)

class QuestionOptionInline(admin.TabularInline):
    model = QuestionOption
    extra = 2

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'subject', 'type', 'points', 'author', 'created_at')
    list_filter = ('type', 'subject', 'author')
    search_fields = ('text', 'subject__name')
    inlines = [QuestionOptionInline] 