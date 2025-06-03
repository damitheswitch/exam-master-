from django.urls import path
from . import views

urlpatterns = [
    # Teacher/Admin exam management
    path('', views.ExamListCreateView.as_view(), name='exam_list_create'),
    path('<int:pk>/', views.ExamDetailView.as_view(), name='exam_detail'),
    path('<int:pk>/publish/', views.publish_exam, name='publish_exam'),
    path('<int:pk>/unpublish/', views.unpublish_exam, name='unpublish_exam'),
    
    # Student exam access
    path('available/', views.StudentExamListView.as_view(), name='student_exam_list'),
    path('take/<int:pk>/', views.exam_detail_for_student, name='exam_detail_for_student'),
] 