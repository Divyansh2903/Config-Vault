import requests
import uuid
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_api_auth_reset_password_with_valid_token():
    # Step 1: Register a new user
    register_url = f"{BASE_URL}/api/auth/register"
    unique_email = f"testuser_{uuid.uuid4().hex}@example.com"
    original_password = "OriginalPass123!"
    new_password = "NewPass123!"
    register_payload = {
        "email": unique_email,
        "password": original_password
    }
    register_resp = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
    assert register_resp.status_code == 201
    # PRD allows 201 response returning user/session (not specified keys), so just check keys exist
    register_json = register_resp.json()
    assert isinstance(register_json, dict) and len(register_json) > 0

    # Step 2: Request password reset token via forgot-password
    forgot_password_url = f"{BASE_URL}/api/auth/forgot-password"
    forgot_payload = {"email": unique_email}
    forgot_resp = requests.post(forgot_password_url, json=forgot_payload, timeout=TIMEOUT)
    assert forgot_resp.status_code == 200

    # Step 3: Simulate reset token retrieval (not in PRD), use placeholder token
    forgot_json = forgot_resp.json()
    reset_token = forgot_json.get("token")
    if not reset_token:
        reset_token = "valid-reset-token-for-test"

    # Step 4: POST /api/auth/reset-password with valid token and new password
    reset_password_url = f"{BASE_URL}/api/auth/reset-password"
    reset_payload = {
        "token": reset_token,
        "newPassword": new_password
    }
    reset_resp = requests.post(reset_password_url, json=reset_payload, timeout=TIMEOUT)
    assert reset_resp.status_code == 200
    # PRD states 200 ok - likely just ok message or empty, so check content
    reset_json = reset_resp.json() if reset_resp.content else {}
    # Accept either empty response or {"ok": true} or "ok" string
    assert reset_json == {} or reset_json.get("ok") is True or reset_json == "ok"

    # Step 5: Verify new password works by login
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "email": unique_email,
        "password": new_password
    }
    login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200
    login_json = login_resp.json()
    assert login_json.get("ok") is True

test_post_api_auth_reset_password_with_valid_token()
