# ExamMaster Frontend Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Install Node.js

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Download **Node.js 20.x.x LTS** (Long Term Support)
   - Run the installer
   - ✅ **IMPORTANT:** Check "Add to PATH" during installation

2. **Verify Installation:**
   Open a new terminal/command prompt and run:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers like:
   ```
   v20.19.1
   npm 10.x.x
   ```

### Step 2: Install Frontend Dependencies

1. **Navigate to frontend directory:**
   ```bash
   cd front-end
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This will install all React dependencies (may take 2-3 minutes)

### Step 3: Start the React Development Server

```bash
npm run dev
```

The React app will start on: **http://localhost:5173/**

## 🎯 Testing the Full Application

### 1. **Make sure Django backend is running:**
   ```bash
   # In backend directory
   cd backend
   venv\Scripts\activate
   python manage.py runserver
   ```
   Django should be running on: **http://127.0.0.1:8000/**

### 2. **Start React frontend:**
   ```bash
   # In front-end directory
   cd front-end
   npm run dev
   ```
   React should be running on: **http://localhost:5173/**

### 3. **Test Login with Sample Users:**

Visit: **http://localhost:5173/login**

**Quick Login Options:**
- **Admin:** admin@exammaster.com / admin123
- **Teacher:** teacher@exammaster.com / teacher123
- **Student:** student@exammaster.com / student123

## 🔧 What's Been Updated

### ✅ **API Integration Added:**
- Created `/src/lib/api.js` - Complete Django API integration
- Updated `LoginPage.jsx` - Now connects to Django backend
- Added loading states and error handling
- Added quick login buttons for testing

### ✅ **Features Available:**

**Admin Role:**
- User management
- Question management
- Exam management
- View all submissions

**Teacher Role:**
- Create/edit questions
- Create/edit exams
- View submissions for their exams

**Student Role:**
- View available exams
- Take exams with timer
- View results

## 🚨 Troubleshooting

### Issue 1: Node.js not found
```bash
# Try these commands
node --version
npm --version
```
If not found, reinstall Node.js and make sure "Add to PATH" is checked.

### Issue 2: npm install fails
```bash
# Clear npm cache and try again
npm cache clean --force
npm install
```

### Issue 3: React app won't start
```bash
# Make sure you're in the front-end directory
cd front-end
npm run dev
```

### Issue 4: API connection fails
- Make sure Django backend is running on http://127.0.0.1:8000/
- Check browser console for CORS errors
- Verify Django CORS settings allow localhost:5173

## 📱 **How to Test Each Role:**

### **Admin Testing:**
1. Login as admin@exammaster.com / admin123
2. Go to `/admin/users` - Manage users
3. Go to `/admin/questions` - Manage questions
4. Go to `/admin/exams` - Manage exams

### **Teacher Testing:**
1. Login as teacher@exammaster.com / teacher123
2. Go to `/teacher/questions` - Create questions
3. Go to `/teacher/exams` - Create exams
4. Publish exams for students

### **Student Testing:**
1. Login as student@exammaster.com / student123
2. Go to `/student/exams` - View available exams
3. Take an exam
4. View results

## 🎊 **Success Indicators:**

✅ **Frontend running:** http://localhost:5173/  
✅ **Backend running:** http://127.0.0.1:8000/  
✅ **Login works:** Can login with sample credentials  
✅ **API connected:** No CORS errors in browser console  
✅ **Role-based access:** Different dashboards for each role  

## 📞 **Need Help?**

If you encounter issues:
1. Check both frontend and backend are running
2. Check browser console for errors
3. Verify API endpoints are accessible
4. Make sure CORS is properly configured

Your ExamMaster application should now be fully functional with React frontend connected to Django backend! 🚀 