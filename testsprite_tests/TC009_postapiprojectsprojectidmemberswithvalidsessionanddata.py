import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_api_projects_projectid_members_with_valid_session_and_data():
    # Register a new user
    register_url = f"{BASE_URL}/api/auth/register"
    test_user_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    test_user_password = "TestPassword123!"
    register_payload = {
        "email": test_user_email,
        "password": test_user_password,
    }
    register_resp = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
    assert register_resp.status_code == 201, f"Expected 201 on register but got {register_resp.status_code}"
    register_json = register_resp.json()
    assert isinstance(register_json, dict), f"Expected dict response on register but got {register_json}"

    # Login the user to get session cookie
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "email": test_user_email,
        "password": test_user_password,
    }
    login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Expected 200 on login but got {login_resp.status_code}"
    login_json = login_resp.json()
    assert login_json.get("ok") is True, f"Expected ok:true on login response but got {login_json}"
    assert "set-cookie" in login_resp.headers or "Set-Cookie" in login_resp.headers, "Session cookie missing on login"

    # Extract cookie for authenticated requests
    cookies = login_resp.cookies
    assert cookies, "No cookies returned from login"

    # Create a new project to use its projectId
    projects_url = f"{BASE_URL}/api/projects"
    project_name = f"Test Project {uuid.uuid4().hex[:8]}"
    project_payload = {
        "name": project_name,
    }
    project_resp = requests.post(projects_url, json=project_payload, cookies=cookies, timeout=TIMEOUT)
    assert project_resp.status_code == 201, f"Expected 201 on project creation but got {project_resp.status_code}"
    project_json = project_resp.json()
    project_id = project_json.get("id")
    assert project_id, "Project ID missing in project creation response"

    # Function to cleanup project after test execution
    def delete_project():
        del_resp = requests.delete(f"{BASE_URL}/api/projects/{project_id}", cookies=cookies, timeout=TIMEOUT)
        assert del_resp.status_code == 200, f"Expected 200 on project deletion but got {del_resp.status_code}"

    try:
        # Prepare member invitation payload
        new_member_email = f"invited_{uuid.uuid4().hex[:8]}@example.com"
        member_payload = {
            "email": new_member_email,
            "role": "member"
        }

        # Call POST /api/projects/[projectId]/members
        members_url = f"{BASE_URL}/api/projects/{project_id}/members"
        members_resp = requests.post(members_url, json=member_payload, cookies=cookies, timeout=TIMEOUT)

        # Validate response
        assert members_resp.status_code == 201, f"Expected 201 on adding project member but got {members_resp.status_code}"
        member_json = members_resp.json()
        assert member_json.get("email") == new_member_email, f"Expected member email {new_member_email} but got {member_json.get('email')}"
        assert member_json.get("role") == "member", f"Expected member role 'member' but got {member_json.get('role')}"
        assert "id" in member_json and member_json["id"], "Expected member id in response"

        # Cleanup: remove the added member
        member_id = member_json["id"]
        del_member_resp = requests.delete(f"{BASE_URL}/api/projects/{project_id}/members/{member_id}", cookies=cookies, timeout=TIMEOUT)
        assert del_member_resp.status_code == 200, f"Expected 200 on deleting project member but got {del_member_resp.status_code}"

    finally:
        # Cleanup project
        delete_project()


test_post_api_projects_projectid_members_with_valid_session_and_data()
