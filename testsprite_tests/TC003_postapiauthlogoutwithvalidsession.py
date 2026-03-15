import requests

BASE_URL = "http://localhost:3000"

def test_post_api_auth_logout_with_valid_session():
    register_url = f"{BASE_URL}/api/auth/register"
    login_url = f"{BASE_URL}/api/auth/login"
    logout_url = f"{BASE_URL}/api/auth/logout"
    timeout = 30

    user_data = {
        "fullName": "Test User",
        "email": "testuser_logout_validsession@example.com",
        "password": "StrongPassword123!"
    }

    session = requests.Session()

    # Register new user
    register_resp = session.post(register_url, json=user_data, timeout=timeout)
    # According to instructions assert success on 200 status and { ok: true }, not 201
    assert register_resp.status_code == 200, f"Expected 200 but got {register_resp.status_code}"
    register_json = register_resp.json()
    assert register_json.get("ok") is True, f"Expected ok:true but got {register_json}"

    # Login with registered user credentials
    login_payload = {
        "email": user_data["email"],
        "password": user_data["password"]
    }
    login_resp = session.post(login_url, json=login_payload, timeout=timeout)
    assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
    login_json = login_resp.json()
    assert login_json.get("ok") is True, f"Expected ok:true on login but got {login_json}"

    # The session cookie should be set in the session automatically by requests.Session

    # Logout using the valid session cookie
    logout_resp = session.post(logout_url, timeout=timeout)
    assert logout_resp.status_code == 200, f"Logout failed with status {logout_resp.status_code}"

test_post_api_auth_logout_with_valid_session()