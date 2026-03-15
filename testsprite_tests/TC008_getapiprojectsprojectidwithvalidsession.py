import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_get_api_projects_projectid_with_valid_session():
    session = requests.Session()
    email = f"testuser_{uuid.uuid4()}@example.com"
    password = "TestPassword123!"
    project_name = f"Test Project {uuid.uuid4()}"

    # Register user
    register_payload = {"email": email, "password": password}
    register_resp = session.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
    assert register_resp.status_code == 201, f"Register failed: {register_resp.text}"
    register_json = register_resp.json()
    assert isinstance(register_json, dict), f"Unexpected register response: {register_json}"
    assert "id" in register_json or "email" in register_json, f"Register response missing id or email: {register_json}"

    # Login user
    login_payload = {"email": email, "password": password}
    login_resp = session.post(f"{BASE_URL}/api/auth/login", json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    login_json = login_resp.json()
    assert login_json.get("ok") is True, f"Login response missing ok: {login_json}"
    # session cookie should be set automatically by requests.Session

    # Create project (POST /api/projects)
    project_payload = {"name": project_name}
    create_project_resp = session.post(f"{BASE_URL}/api/projects", json=project_payload, timeout=TIMEOUT)
    assert create_project_resp.status_code == 201, f"Create project failed: {create_project_resp.text}"
    project = create_project_resp.json()
    project_id = project.get("id") or project.get("_id") or project.get("projectId")
    assert project_id, "Project ID not found in creation response"

    try:
        # GET /api/projects/[projectId] with valid session cookie
        get_project_resp = session.get(f"{BASE_URL}/api/projects/{project_id}", timeout=TIMEOUT)
        assert get_project_resp.status_code == 200, f"Get project failed: {get_project_resp.text}"
        project_detail = get_project_resp.json()

        # Validate project detail includes environments and membership info possibly
        project_detail_id = project_detail.get("id") or project_detail.get("_id")
        assert project_detail_id == project_id, "Project ID mismatch in get response"
        assert "environments" in project_detail, "Environments key missing in project details"
        assert isinstance(project_detail["environments"], list), "Environments should be a list"

    finally:
        # Clean up - delete created project
        del_resp = session.delete(f"{BASE_URL}/api/projects/{project_id}", timeout=TIMEOUT)
        assert del_resp.status_code == 200, f"Delete project failed: {del_resp.text}"

test_get_api_projects_projectid_with_valid_session()
