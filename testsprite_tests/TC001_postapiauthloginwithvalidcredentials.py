import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_postapiauthloginwithvalidcredentials():
    register_url = f"{BASE_URL}/api/auth/register"
    login_url = f"{BASE_URL}/api/auth/login"

    # Generate unique email for test user
    unique_email = f"testuser_{uuid.uuid4()}@example.com"
    password = "TestPassword123!"
    full_name = "Test User"

    # Register new user first
    register_payload = {
        "email": unique_email,
        "password": password
    }
    register_resp = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
    assert register_resp.status_code == 201, f"Unexpected registration status code: {register_resp.status_code}, response: {register_resp.text}"

    # Login with newly registered user credentials
    login_payload = {
        "email": unique_email,
        "password": password
    }
    login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)

    assert login_resp.status_code == 200, f"Login failed with status code {login_resp.status_code}, response: {login_resp.text}"

    json_data = login_resp.json()
    assert "ok" in json_data and json_data["ok"] is True, f"Login response missing or incorrect 'ok': {json_data}"

    # Assert session cookie is set in response cookies
    cookies = login_resp.cookies
    session_cookie_set = False
    for cookie in cookies:
        if "session" in cookie.name.lower():
            session_cookie_set = True
            break
    assert session_cookie_set, f"Session cookie not set in login response cookies: {cookies}"

test_postapiauthloginwithvalidcredentials()