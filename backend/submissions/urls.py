from django.urls import path
from . import views

urlpatterns = [
    # Submission management (Teachers/Admins)
    path('', views.SubmissionListView.as_view(), name='submission_list'),
    path('<int:pk>/', views.SubmissionDetailView.as_view(), name='submission_detail'),
    
    # Student submission and results
    path('submit/', views.submit_exam, name='submit_exam'),
    path('my-results/', views.student_results, name='student_results'),
    path('result/<int:pk>/', views.submission_result, name='submission_result'),
] 