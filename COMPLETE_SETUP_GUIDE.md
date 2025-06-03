# 🚀 ExamMaster Complete Setup Guide

## ✅ Current Status

**Frontend**: ✅ **WORKING** - React app running on http://localhost:5173/  
**Backend**: ⚠️ **NEEDS SETUP** - Django server needs to be started properly

## 🔧 Quick Fix for Backend

### Option 1: Use the Batch File (Recommended)

1. **Open a NEW Command Prompt or PowerShell window**
2. **Navigate to backend directory:**
   ```cmd
   cd "C:\Users\ASUS\Desktop\web design 5 star\horizon\backend"
   ```
3. **Run the batch file:**
   ```cmd
   start_django.bat
   ```

### Option 2: Manual Steps

1. **Open a NEW Command Prompt or PowerShell window**
2. **Navigate and activate:**
   ```cmd
   cd "C:\Users\ASUS\Desktop\web design 5 star\horizon\backend"
   venv\Scripts\activate
   ```
3. **Start Django:**
   ```cmd
   py manage.py runserver localhost:8000
   ```

## 🎯 Testing Your Setup

### 1. **Backend Test:**
- Open browser: http://localhost:8000/
- You should see Django welcome page or API response

### 2. **Frontend Test:**
- Your React app is already running on: http://localhost:5173/
- Login with test credentials:
  - **Admin:** admin@exammaster.com / admin123
  - **Teacher:** teacher@exammaster.com / teacher123  
  - **Student:** student@exammaster.com / student123

### 3. **Full Integration Test:**
- Go to http://localhost:5173/login
- Try logging in with any test account
- If login works, the integration is successful!

## 🚨 Troubleshooting

### Issue: "Could not find platform independent libraries"
This is a Python warning, not an error. Django should still work.

### Issue: Django won't start
1. Make sure you're in the backend directory
2. Make sure virtual environment is activated
3. Try: `py manage.py check` to see if there are any issues

### Issue: React can't connect to Django
1. Make sure Django is running on http://localhost:8000/
2. Check browser console for CORS errors
3. Make sure both servers are running simultaneously

## 📱 **What You Should See:**

### **Backend Running Successfully:**
```
Starting development server at http://localhost:8000/
Quit the server with CTRL-BREAK.
```

### **Frontend Running Successfully:**
```
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### **Successful Login:**
- Login page loads without errors
- Can click "Admin Login" button and get logged in
- Redirected to appropriate dashboard

## 🎊 **Success Indicators:**

✅ **Backend:** Django server shows "Starting development server at http://localhost:8000/"  
✅ **Frontend:** React app accessible at http://localhost:5173/  
✅ **Integration:** Can login with test credentials  
✅ **API:** No CORS errors in browser console  

## 📞 **Need Help?**

If you're still having issues:

1. **Check both terminals** - Make sure both frontend and backend are running
2. **Try the batch file** - It handles all the setup automatically
3. **Check browser console** - Look for any error messages
4. **Restart everything** - Sometimes a fresh start helps

## 🎯 **Quick Start Commands:**

**Terminal 1 (Backend):**
```cmd
cd "C:\Users\ASUS\Desktop\web design 5 star\horizon\backend"
start_django.bat
```

**Terminal 2 (Frontend):**
```cmd
cd "C:\Users\ASUS\Desktop\web design 5 star\horizon\front-end"
npm run dev
```

**Then visit:** http://localhost:5173/login

Your ExamMaster application should now be fully functional! 🚀 