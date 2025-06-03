import json
import urllib.request
import urllib.error

# Test login endpoint
url = "http://localhost:8000/api/auth/login/"
data = {
    "email": "student@test.com",
    "password": "student123"
}

try:
    # Prepare the request
    req_data = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=req_data, headers={'Content-Type': 'application/json'})
    
    # Make the request
    response = urllib.request.urlopen(req)
    result = json.loads(response.read().decode('utf-8'))
    
    print("✅ Login successful!")
    print(f"User: {result.get('user', {}).get('email')}")
    print(f"Access Token: {result.get('access', 'N/A')[:20]}...")
    print(f"Full response: {json.dumps(result, indent=2)}")
    
except urllib.error.HTTPError as e:
    print(f"❌ HTTP Error {e.code}")
    error_data = e.read().decode('utf-8')
    print(f"Error response: {error_data}")
    
except urllib.error.URLError as e:
    print(f"❌ Connection Error: {e}")
    
except Exception as e:
    print(f"❌ Error: {e}") 