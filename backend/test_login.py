import requests
import json

# Test login endpoint
url = "http://localhost:8000/api/auth/login/"
data = {
    "email": "student@test.com",
    "password": "student123"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("\n✅ Login successful!")
        result = response.json()
        print(f"User: {result.get('user', {}).get('email')}")
        print(f"Access Token: {result.get('access', 'N/A')[:20]}...")
    else:
        print("\n❌ Login failed!")
        
except requests.exceptions.ConnectionError:
    print("❌ Cannot connect to server. Make sure Django server is running on http://localhost:8000")
except Exception as e:
    print(f"❌ Error: {e}") 
 