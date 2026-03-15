import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_api_auth_register_with_valid_data():
    url = f"{BASE_URL}/api/auth/register"
    headers = {
        "Content-Type": "application/json"
    }
    # Generate unique email to avoid duplicate conflict
    unique_email = f"testuser_{uuid.uuid4().hex}@example.com"
    payload = {
        "fullName": "Test User",
        "email": unique_email,
        "password": "TestPassword123!"
    }

    response = None
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        # Assert status code is 200 as per instructions (not 201)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}, response: {response.text}"

        json_response = response.json()
        # Assert response body contains { ok: true }
        assert isinstance(json_response, dict), "Response JSON is not a dictionary"
        assert "ok" in json_response, "'ok' key not found in response"
        assert json_response["ok"] is True, f"Expected ok: true, got {json_response['ok']}"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_auth_register_with_valid_data()