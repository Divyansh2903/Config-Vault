import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Replace these with valid credentials for authentication
TEST_USER_EMAIL = "testuser@example.com"
TEST_USER_PASSWORD = "TestPassword123!"

def test_post_api_projects_with_valid_data():
    session = requests.Session()
    try:
        # Login to get session cookie
        login_payload = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        login_resp = session.post(f"{BASE_URL}/api/auth/login", json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_json = login_resp.json()
        assert login_json.get("ok") is True, "Login response 'ok' field is not True"

        # Prepare project creation payload with a unique project name
        project_name = f"TestProject-{uuid.uuid4()}"
        post_payload = {
            "name": project_name
        }
        # optionalEnvImport is optional; here it's omitted

        # Create a new project
        create_resp = session.post(f"{BASE_URL}/api/projects", json=post_payload, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Project creation failed: {create_resp.text}"
        project = create_resp.json()
        assert isinstance(project, dict), "Project response is not a dictionary"
        assert project.get("name") == project_name, "Project name in response does not match"
        project_id = project.get("id")
        assert project_id is not None, "Project ID missing in response"

    finally:
        # Cleanup: delete the created project if it was created
        if 'project_id' in locals():
            delete_resp = session.delete(f"{BASE_URL}/api/projects/{project_id}", timeout=TIMEOUT)
            if delete_resp.status_code not in (200, 403, 404):
                raise Exception(f"Failed to delete test project: {delete_resp.status_code} {delete_resp.text}")

    session.close()

test_post_api_projects_with_valid_data()