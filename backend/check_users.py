import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exammaster.settings')
django.setup()

from django.contrib.auth import get_user_model, authenticate

User = get_user_model()

print("=== Checking existing users ===")
users = User.objects.all()
for user in users:
    print(f"- Email: {user.email}, Username: {user.username}, Role: {user.role}")

print("\n=== Testing authentication ===")
test_credentials = [
    ("student@test.com", "student123"),
    ("teacher@test.com", "teacher123"),
    ("admin@test.com", "admin123"),
]

for email, password in test_credentials:
    print(f"\nTesting {email} / {password}")
    
    # Check if user exists
    try:
        user = User.objects.get(email=email)
        print(f"  ✅ User exists: {user.username}")
        
        # Test password
        if user.check_password(password):
            print(f"  ✅ Password is correct")
        else:
            print(f"  ❌ Password is incorrect")
            
        # Test authentication
        auth_user = authenticate(email=email, password=password)
        if auth_user:
            print(f"  ✅ Authentication successful")
        else:
            print(f"  ❌ Authentication failed")
            
    except User.DoesNotExist:
        print(f"  ❌ User does not exist") 