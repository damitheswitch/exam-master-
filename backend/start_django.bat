@echo off
echo Starting Django ExamMaster Backend...
echo.

cd /d "%~dp0"
call venv\Scripts\activate.bat

echo Checking Django installation...
py manage.py check

echo.
echo Starting Django development server...
echo Backend will be available at: http://localhost:8000/
echo Admin panel will be available at: http://localhost:8000/admin/
echo API endpoints will be available at: http://localhost:8000/api/
echo.
echo Press Ctrl+C to stop the server
echo.

py manage.py runserver localhost:8000 