from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from questions.models import Subject, Question, QuestionOption
from exams.models import Exam, ExamQuestion

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample data for testing the ExamMaster application'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create users
        admin_user, created = User.objects.get_or_create(
            email='admin@exammaster.com',
            defaults={
                'username': 'admin',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(f'Created admin user: {admin_user.email}')

        teacher_user, created = User.objects.get_or_create(
            email='teacher@exammaster.com',
            defaults={
                'username': 'teacher',
                'first_name': 'John',
                'last_name': 'Teacher',
                'role': 'teacher'
            }
        )
        if created:
            teacher_user.set_password('teacher123')
            teacher_user.save()
            self.stdout.write(f'Created teacher user: {teacher_user.email}')

        student_user, created = User.objects.get_or_create(
            email='student@exammaster.com',
            defaults={
                'username': 'student',
                'first_name': 'Jane',
                'last_name': 'Student',
                'role': 'student'
            }
        )
        if created:
            student_user.set_password('student123')
            student_user.save()
            self.stdout.write(f'Created student user: {student_user.email}')

        # Create subjects
        math_subject, created = Subject.objects.get_or_create(
            name='Mathematics',
            defaults={'description': 'Basic mathematics questions'}
        )
        if created:
            self.stdout.write(f'Created subject: {math_subject.name}')

        science_subject, created = Subject.objects.get_or_create(
            name='Science',
            defaults={'description': 'General science questions'}
        )
        if created:
            self.stdout.write(f'Created subject: {science_subject.name}')

        # Create sample questions
        if not Question.objects.filter(text__contains='What is 2 + 2?').exists():
            math_q1 = Question.objects.create(
                text='What is 2 + 2?',
                subject=math_subject,
                type='single-choice',
                points=1,
                author=teacher_user
            )
            QuestionOption.objects.create(question=math_q1, text='3', is_correct=False, order=1)
            QuestionOption.objects.create(question=math_q1, text='4', is_correct=True, order=2)
            QuestionOption.objects.create(question=math_q1, text='5', is_correct=False, order=3)
            QuestionOption.objects.create(question=math_q1, text='6', is_correct=False, order=4)
            self.stdout.write(f'Created question: {math_q1.text}')

        if not Question.objects.filter(text__contains='Which of the following are prime numbers?').exists():
            math_q2 = Question.objects.create(
                text='Which of the following are prime numbers?',
                subject=math_subject,
                type='multiple-choice',
                points=2,
                author=teacher_user
            )
            QuestionOption.objects.create(question=math_q2, text='2', is_correct=True, order=1)
            QuestionOption.objects.create(question=math_q2, text='3', is_correct=True, order=2)
            QuestionOption.objects.create(question=math_q2, text='4', is_correct=False, order=3)
            QuestionOption.objects.create(question=math_q2, text='5', is_correct=True, order=4)
            self.stdout.write(f'Created question: {math_q2.text}')

        if not Question.objects.filter(text__contains='What is the chemical symbol for water?').exists():
            science_q1 = Question.objects.create(
                text='What is the chemical symbol for water?',
                subject=science_subject,
                type='single-choice',
                points=1,
                author=teacher_user
            )
            QuestionOption.objects.create(question=science_q1, text='H2O', is_correct=True, order=1)
            QuestionOption.objects.create(question=science_q1, text='CO2', is_correct=False, order=2)
            QuestionOption.objects.create(question=science_q1, text='NaCl', is_correct=False, order=3)
            QuestionOption.objects.create(question=science_q1, text='O2', is_correct=False, order=4)
            self.stdout.write(f'Created question: {science_q1.text}')

        # Create sample exam
        if not Exam.objects.filter(title='Sample Math Test').exists():
            now = timezone.now()
            exam = Exam.objects.create(
                title='Sample Math Test',
                description='A basic mathematics test',
                duration=30,  # 30 minutes
                pass_percentage=60,
                start_time=now,
                end_time=now + timedelta(days=7),
                is_published=True,
                created_by=teacher_user
            )
            
            # Add questions to exam
            math_questions = Question.objects.filter(subject=math_subject)
            for i, question in enumerate(math_questions):
                ExamQuestion.objects.create(
                    exam=exam,
                    question=question,
                    order=i + 1
                )
            
            exam.calculate_total_marks()
            self.stdout.write(f'Created exam: {exam.title}')

        self.stdout.write(
            self.style.SUCCESS('Sample data created successfully!')
        )
        self.stdout.write('Login credentials:')
        self.stdout.write('Admin: admin@exammaster.com / admin123')
        self.stdout.write('Teacher: teacher@exammaster.com / teacher123')
        self.stdout.write('Student: student@exammaster.com / student123') 