import requests
import uuid

BASE_URL = "http://localhost:3000"

def test_post_api_auth_forgot_password_with_valid_email():
    register_url = f"{BASE_URL}/api/auth/register"
    forgot_password_url = f"{BASE_URL}/api/auth/forgot-password"

    unique_email = f"testuser_{uuid.uuid4()}@example.com"
    password = "TestPassword123!"

    # Register a new user
    register_payload = {
        "email": unique_email,
        "password": password
    }
    try:
        reg_response = requests.post(register_url, json=register_payload, timeout=30)
        assert reg_response.status_code == 201, f"Expected 201 on register but got {reg_response.status_code}"

        # Call forgot-password with the registered email
        forgot_payload = {
            "email": unique_email
        }
        forgot_response = requests.post(forgot_password_url, json=forgot_payload, timeout=30)
        assert forgot_response.status_code == 200, f"Expected 200 on forgot-password but got {forgot_response.status_code}"

        forgot_json = forgot_response.json()
        # According to PRD, success is status 200 confirmation (no specific body schema shown)
        # So just ensure no errors and possibly that the response has expected structure or at least is not an error
        assert isinstance(forgot_json, dict), "Forgot password response is not a JSON object"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_auth_forgot_password_with_valid_email()