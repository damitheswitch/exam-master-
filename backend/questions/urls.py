from django.urls import path
from . import views

urlpatterns = [
    path('subjects/', views.SubjectListCreateView.as_view(), name='subject_list_create'),
    path('subjects/<int:pk>/', views.SubjectDetailView.as_view(), name='subject_detail'),
    path('', views.QuestionListCreateView.as_view(), name='question_list_create'),
    path('<int:pk>/', views.QuestionDetailView.as_view(), name='question_detail'),
] 