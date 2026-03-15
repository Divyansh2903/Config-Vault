import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_api_projects_with_valid_session_and_data():
    session = requests.Session()
    try:
        # Register a new user
        register_url = f"{BASE_URL}/api/auth/register"
        full_name = "Test User"
        email = f"testuser_{uuid.uuid4()}@example.com"
        password = "TestPass123!"
        register_payload = {
            "fullName": full_name,
            "email": email,
            "password": password
        }
        reg_resp = session.post(register_url, json=register_payload, timeout=TIMEOUT)
        assert reg_resp.status_code == 200, f"Expected 200 on register but got {reg_resp.status_code}"
        reg_json = reg_resp.json()
        assert reg_json.get("ok") is True, f"Register response body unexpected: {reg_json}"

        # Login with the same credentials
        login_url = f"{BASE_URL}/api/auth/login"
        login_payload = {
            "email": email,
            "password": password
        }
        login_resp = session.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Expected 200 on login but got {login_resp.status_code}"
        login_json = login_resp.json()
        assert login_json.get("ok") is True, f"Login response body unexpected: {login_json}"
        # Session cookie should be set in session automatically

        # Prepare project creation data
        projects_url = f"{BASE_URL}/api/projects"
        project_name = f"Test Project {uuid.uuid4()}"
        project_payload = {
            "name": project_name,
            "optionalEnvImport": None
        }
        create_resp = session.post(projects_url, json=project_payload, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Expected 201 on project creation but got {create_resp.status_code}"
        project = create_resp.json()
        assert "id" in project and isinstance(project["id"], str), "Project details missing 'id'"
        assert project.get("name") == project_name, "Project name in response does not match request"

    finally:
        # Clean up: delete the created project if it exists
        if 'project' in locals() and "id" in project:
            delete_url = f"{BASE_URL}/api/projects/{project['id']}"
            try:
                del_resp = session.delete(delete_url, timeout=TIMEOUT)
                # Accept 200 ok or 403/404 if already deleted or forbidden
                assert del_resp.status_code in (200, 403, 404), f"Unexpected status code when deleting project: {del_resp.status_code}"
            except Exception:
                pass

test_post_api_projects_with_valid_session_and_data()