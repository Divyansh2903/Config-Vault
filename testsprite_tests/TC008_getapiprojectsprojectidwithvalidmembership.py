import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_get_api_projects_projectid_with_valid_membership():
    session = requests.Session()

    # Helper function to register user
    def register_user(email, password):
        url = f"{BASE_URL}/api/auth/register"
        payload = {"email": email, "password": password}
        resp = session.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 201
        return resp.json()

    # Helper function to login user (to get session cookie)
    def login_user(email, password):
        url = f"{BASE_URL}/api/auth/login"
        payload = {"email": email, "password": password}
        resp = session.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 200
        assert resp.json().get("ok") is True
        return resp

    # Helper function to create a project
    def create_project(name):
        url = f"{BASE_URL}/api/projects"
        payload = {"name": name}
        resp = session.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 201
        return resp.json()

    # Helper function to invite member
    def invite_member(project_id, email, role):
        url = f"{BASE_URL}/api/projects/{project_id}/members"
        payload = {"email": email, "role": role}
        resp = session.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 201
        return resp.json()

    # Helper function to delete project
    def delete_project(project_id):
        url = f"{BASE_URL}/api/projects/{project_id}"
        resp = session.delete(url, timeout=TIMEOUT)
        # Accept 200 ok or 403 if unauthorized to delete
        if resp.status_code not in (200, 403, 404):
            resp.raise_for_status()

    # Helper function to logout user
    def logout_user():
        url = f"{BASE_URL}/api/auth/logout"
        resp = session.post(url, timeout=TIMEOUT)
        # Accept 200 ok or ignore errors in cleanup
        if resp.status_code != 200:
            pass

    # Create first user (project owner)
    owner_email = f"owner_{uuid.uuid4()}@example.com"
    owner_password = "OwnerPass123!"
    register_user(owner_email, owner_password)
    login_user(owner_email, owner_password)

    project = None
    invited_user = None
    invited_session = requests.Session()

    try:
        # Create a new project as owner
        project = create_project(f"Project_{uuid.uuid4()}")

        project_id = project.get("id")
        assert project_id is not None, "Project ID not found in create response"

        # Create invited user (project member)
        member_email = f"member_{uuid.uuid4()}@example.com"
        member_password = "MemberPass123!"
        # Register member
        resp = invited_session.post(f"{BASE_URL}/api/auth/register", json={"email": member_email, "password": member_password}, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 201

        # Owner invites member with role "member"
        invited_user = invite_member(project_id, member_email, "member")
        assert invited_user is not None and "id" in invited_user

        # Member logs in to get session cookie
        resp = invited_session.post(f"{BASE_URL}/api/auth/login", json={"email": member_email, "password": member_password}, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 200 and resp.json().get("ok") is True

        # Member requests GET /api/projects/[projectId]
        url = f"{BASE_URL}/api/projects/{project_id}"
        headers = {}
        resp = invited_session.get(url, headers=headers, timeout=TIMEOUT)

        # Validate response 200 and structure
        assert resp.status_code == 200
        project_data = resp.json()
        assert "id" in project_data and project_data["id"] == project_id
        # Ensure environments field exists and is a list
        assert "environments" in project_data and isinstance(project_data["environments"], list)

    finally:
        # Cleanup: delete project as owner
        if project:
            delete_project(project.get("id"))

        # Logout sessions
        try:
            logout_user()
        except:
            pass
        try:
            invited_session.post(f"{BASE_URL}/api/auth/logout", timeout=TIMEOUT)
        except:
            pass

test_get_api_projects_projectid_with_valid_membership()