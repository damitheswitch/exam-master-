# ExamMaster Django Backend

A comprehensive Django REST API backend for the ExamMaster online examination system.

## Features

- **User Management**: Role-based authentication (Admin, Teacher, Student)
- **Question Bank**: Create and manage multiple-choice and single-choice questions
- **Exam Management**: Create, schedule, and publish exams
- **Automatic Grading**: Real-time scoring for objective questions
- **Submission Tracking**: Track student submissions and results
- **Admin Panel**: Full Django admin interface for system management

## Tech Stack

- Django 4.2.7
- Django REST Framework 3.14.0
- JWT Authentication
- SQLite (default) / PostgreSQL support
- CORS enabled for frontend integration

## Installation

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Setup

1. **Create Virtual Environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ```

4. **Database Setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create Superuser**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run Development Server**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/update/` - Update user profile
- `POST /api/auth/token/refresh/` - Refresh JWT token

### User Management (Admin only)
- `GET /api/auth/users/` - List all users
- `POST /api/auth/users/` - Create new user
- `GET /api/auth/users/{id}/` - Get user details
- `PUT /api/auth/users/{id}/` - Update user
- `DELETE /api/auth/users/{id}/` - Delete user

### Questions
- `GET /api/questions/subjects/` - List subjects
- `POST /api/questions/subjects/` - Create subject (Teacher/Admin)
- `GET /api/questions/` - List questions
- `POST /api/questions/` - Create question (Teacher/Admin)
- `GET /api/questions/{id}/` - Get question details
- `PUT /api/questions/{id}/` - Update question (Teacher/Admin)
- `DELETE /api/questions/{id}/` - Delete question (Teacher/Admin)

### Exams
- `GET /api/exams/` - List exams (Teacher/Admin)
- `POST /api/exams/` - Create exam (Teacher/Admin)
- `GET /api/exams/{id}/` - Get exam details (Teacher/Admin)
- `PUT /api/exams/{id}/` - Update exam (Teacher/Admin)
- `DELETE /api/exams/{id}/` - Delete exam (Teacher/Admin)
- `POST /api/exams/{id}/publish/` - Publish exam (Teacher/Admin)
- `POST /api/exams/{id}/unpublish/` - Unpublish exam (Teacher/Admin)

### Student Exam Access
- `GET /api/exams/available/` - List available exams (Student)
- `GET /api/exams/take/{id}/` - Get exam for taking (Student)

### Submissions
- `POST /api/submissions/submit/` - Submit exam answers (Student)
- `GET /api/submissions/my-results/` - Get student's results (Student)
- `GET /api/submissions/result/{id}/` - Get detailed result
- `GET /api/submissions/` - List all submissions (Teacher/Admin)

## User Roles

### Admin
- Full system access
- Manage all users, questions, exams, and submissions
- Access Django admin panel

### Teacher
- Create and manage questions
- Create and manage exams
- View submissions for their exams
- Publish/unpublish exams

### Student
- View available exams
- Take exams
- View their results
- Submit exam answers

## Data Models

### User
- Custom user model with role-based access
- Fields: email, username, first_name, last_name, role

### Subject
- Categorize questions by subject
- Fields: name, description

### Question
- Support for single-choice and multiple-choice questions
- Fields: text, subject, type, points, author

### QuestionOption
- Answer options for questions
- Fields: text, is_correct, order

### Exam
- Exam configuration and scheduling
- Fields: title, description, duration, start_time, end_time, is_published

### ExamSubmission
- Student exam submissions
- Fields: student, exam, score, percentage, is_passed, tab_switches

### StudentAnswer
- Individual question answers
- Fields: question, selected_options, is_correct, points_earned

## Security Features

- JWT-based authentication
- Role-based permissions
- CORS protection
- Input validation and sanitization
- Secure password handling

## Development

### Running Tests
```bash
python manage.py test
```

### Creating Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Accessing Admin Panel
Visit `http://localhost:8000/admin/` and login with superuser credentials.

## Frontend Integration

The backend is designed to work with the React frontend. Make sure to:

1. Update CORS settings in `settings.py` for your frontend URL
2. Use the provided API endpoints for authentication and data management
3. Handle JWT tokens for authenticated requests

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in settings
2. Configure a production database (PostgreSQL recommended)
3. Set up proper static file serving
4. Configure environment variables securely
5. Use a production WSGI server like Gunicorn

## Support

For issues and questions, please refer to the Django and Django REST Framework documentation. 