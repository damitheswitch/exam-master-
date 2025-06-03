import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test users for development'

    def handle(self, *args, **options):
        # Create test admin user
        if not User.objects.filter(email='admin@test.com').exists():
            try:
                admin_user = User.objects.create_user(
                    username='admin_test',
                    email='admin@test.com',
                    password='admin123',
                    first_name='Admin',
                    last_name='User',
                    role='admin'
                )
                admin_user.is_staff = True
                admin_user.is_superuser = True
                admin_user.save()
                self.stdout.write(self.style.SUCCESS('Created admin user: admin@test.com / admin123'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Admin user creation failed: {e}'))

        # Create test teacher user
        if not User.objects.filter(email='teacher@test.com').exists():
            try:
                User.objects.create_user(
                    username='teacher_test',
                    email='teacher@test.com',
                    password='teacher123',
                    first_name='Teacher',
                    last_name='User',
                    role='teacher'
                )
                self.stdout.write(self.style.SUCCESS('Created teacher user: teacher@test.com / teacher123'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Teacher user creation failed: {e}'))

        # Create test student user
        if not User.objects.filter(email='student@test.com').exists():
            try:
                User.objects.create_user(
                    username='student_test',
                    email='student@test.com',
                    password='student123',
                    first_name='Student',
                    last_name='User',
                    role='student'
                )
                self.stdout.write(self.style.SUCCESS('Created student user: student@test.com / student123'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Student user creation failed: {e}'))

        # List existing users
        self.stdout.write(self.style.SUCCESS('\nExisting users:'))
        for user in User.objects.all():
            self.stdout.write(f'- {user.email} ({user.role}) - Username: {user.username}')

        self.stdout.write(self.style.SUCCESS('\nYou can use any of these accounts to test login!')) 