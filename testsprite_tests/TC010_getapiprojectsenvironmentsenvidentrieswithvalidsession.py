import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_get_api_environments_envId_entries_with_valid_session():
    session = requests.Session()
    # Register new user
    register_url = f"{BASE_URL}/api/auth/register"
    user_email = f"testuser_{uuid.uuid4()}@example.com"
    register_payload = {
        "email": user_email,
        "password": "TestPassword123!"
    }
    register_resp = session.post(register_url, json=register_payload, timeout=TIMEOUT)
    assert register_resp.status_code == 201
    # Register response returns 201 user/session; continue to login to get session cookie properly
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "email": user_email,
        "password": "TestPassword123!"
    }
    login_resp = session.post(login_url, json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200
    login_json = login_resp.json()
    assert "ok" in login_json and login_json["ok"] is True
    # The session is persisted in the requests.Session via cookies

    project_id = None
    env_id = None

    try:
        # Create a project to get environments
        projects_url = f"{BASE_URL}/api/projects"
        project_name = f"TestProject_{uuid.uuid4()}"
        project_payload = {"name": project_name}
        create_proj_resp = session.post(projects_url, json=project_payload, timeout=TIMEOUT)
        assert create_proj_resp.status_code == 201
        proj_json = create_proj_resp.json()
        assert "id" in proj_json
        project_id = proj_json["id"]

        # Get the project details to obtain environments
        get_proj_url = f"{BASE_URL}/api/projects/{project_id}"
        get_proj_resp = session.get(get_proj_url, timeout=TIMEOUT)
        assert get_proj_resp.status_code == 200
        proj_details = get_proj_resp.json()
        assert "environments" in proj_details and isinstance(proj_details["environments"], list)
        environments = proj_details["environments"]
        # Use first environment if available or create one if API supported (not indicated)
        if environments:
            env_id = environments[0]["id"]
        else:
            # No environment found and no explicit create environment endpoint usage in PRD required here.
            # However, in PRD there is POST /api/projects/[projectId]/environments to create environment if custom envs added.
            # We create a new environment to ensure envId exists.
            create_env_url = f"{BASE_URL}/api/projects/{project_id}/environments"
            env_payload = {"name": f"Env_{uuid.uuid4()}"}
            create_env_resp = session.post(create_env_url, json=env_payload, timeout=TIMEOUT)
            assert create_env_resp.status_code == 201
            env_json = create_env_resp.json()
            assert "id" in env_json
            env_id = env_json["id"]

        assert env_id is not None

        # Test GET /api/environments/[envId]/entries with valid session
        entries_url = f"{BASE_URL}/api/environments/{env_id}/entries"
        entries_resp = session.get(entries_url, timeout=TIMEOUT)
        assert entries_resp.status_code == 200
        entries_json = entries_resp.json()
        assert isinstance(entries_json, list)

    finally:
        # Clean up: delete created project to not leave residual data
        if project_id:
            del_proj_url = f"{BASE_URL}/api/projects/{project_id}"
            del_resp = session.delete(del_proj_url, timeout=TIMEOUT)
            # Accept 200 ok or 403/404 if already deleted or no permission, but ideally 200
            assert del_resp.status_code in (200, 403, 404)


test_get_api_environments_envId_entries_with_valid_session()
