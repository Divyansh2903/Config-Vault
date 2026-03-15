import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_get_api_auth_me_with_valid_session():
    # Register new user
    register_url = f"{BASE_URL}/api/auth/register"
    full_name = "Test User"
    email = f"testuser_{int((requests.utils.default_headers().get('Date', '0').encode()[-3:]))}@example.com"
    password = "TestPassword123!"
    register_payload = {
        "fullName": full_name,
        "email": email,
        "password": password
    }
    try:
        register_resp = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
        assert register_resp.status_code == 200, f"Expected 200 from register, got {register_resp.status_code}"
        register_body = register_resp.json()
        assert register_body.get("ok") is True, f"Expected ok: true from register, got {register_body}"
    except Exception as e:
        raise AssertionError(f"Failed to register user: {e}")

    # Login with registered user
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "email": email,
        "password": password,
    }
    try:
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Expected 200 from login, got {login_resp.status_code}"
        login_body = login_resp.json()
        assert login_body.get("ok") is True, f"Expected ok: true from login, got {login_body}"
        cookies = login_resp.cookies
        assert cookies, "No session cookie set on login"
    except Exception as e:
        raise AssertionError(f"Failed to login user: {e}")

    # Access /api/auth/me with valid session cookie
    auth_me_url = f"{BASE_URL}/api/auth/me"
    try:
        me_resp = requests.get(auth_me_url, cookies=cookies, timeout=TIMEOUT)
        assert me_resp.status_code == 200, f"Expected 200 from auth/me, got {me_resp.status_code}"
        profile = me_resp.json()
        # Validate profile response has expected keys
        assert isinstance(profile, dict) and profile, "Profile response should be a non-empty dict"
        # Minimal check: profile should at least contain email matching registered user
        assert profile.get("email") == email, f"Profile email {profile.get('email')} does not match registered email {email}"
    except Exception as e:
        raise AssertionError(f"Failed to get profile with valid session: {e}")
    
test_get_api_auth_me_with_valid_session()