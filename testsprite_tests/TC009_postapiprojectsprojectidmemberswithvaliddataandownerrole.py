import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_api_projects_projectid_members_with_valid_data_and_owner_role():
    # Helper function to register a new user
    def register_user(email, password):
        resp = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": email, "password": password},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 201, f"Register failed: {resp.text}"
        return resp.cookies

    # Helper function to login and get session cookies
    def login_user(email, password):
        resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": email, "password": password},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Login failed: {resp.text}"
        return resp.cookies

    # Helper function to create a project
    def create_project(session_cookies, name):
        resp = requests.post(
            f"{BASE_URL}/api/projects",
            cookies=session_cookies,
            json={"name": name},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 201, f"Project creation failed: {resp.text}"
        return resp.json()

    # Helper function to delete a project
    def delete_project(session_cookies, project_id):
        resp = requests.delete(
            f"{BASE_URL}/api/projects/{project_id}",
            cookies=session_cookies,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Project deletion failed: {resp.text}"

    owner_email = f"owner_{uuid.uuid4().hex}@example.com"
    owner_password = "StrongPass123!"

    member_email = f"member_{uuid.uuid4().hex}@example.com"
    member_role = "member"

    # Register and login as owner
    owner_register_cookies = register_user(owner_email, owner_password)
    owner_session_cookies = login_user(owner_email, owner_password)

    project = None
    member = None

    try:
        # Create a new project as owner
        project = create_project(owner_session_cookies, f"TestProject_{uuid.uuid4().hex}")

        project_id = project.get("id")
        assert project_id, "Project ID missing in creation response"

        # POST to /api/projects/[projectId]/members with valid email and role, as owner
        resp = requests.post(
            f"{BASE_URL}/api/projects/{project_id}/members",
            cookies=owner_session_cookies,
            json={
                "email": member_email,
                "role": member_role
            },
            timeout=TIMEOUT,
        )
        assert resp.status_code == 201, f"Add member failed: {resp.text}"
        member = resp.json()
        assert "id" in member, "Member ID missing in response"
        assert member.get("email") == member_email, "Member email does not match"
        assert member.get("role") == member_role, "Member role does not match"
    finally:
        # Cleanup - delete the created project (which should clean members as well)
        if project is not None:
            delete_project(owner_session_cookies, project["id"])

test_post_api_projects_projectid_members_with_valid_data_and_owner_role()