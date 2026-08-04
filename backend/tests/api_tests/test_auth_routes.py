import pytest


@pytest.mark.asyncio
class TestGetCurrentUserRoutes:
    """Tests for GET /auth/me — current user identity."""

    async def test_get_me_returns_employee_schema_for_employee(
        self, as_user, employee_1
    ):
        """Returns the employee's id, name, email and role=employee.
        The department field must be absent or None."""

        client = as_user(employee_1)
        response = client.get("/auth/me")
        data = response.json()

        assert response.status_code == 200
        assert data["id"] == str(employee_1.id)
        assert data["name"] == employee_1.name
        assert data["email"] == employee_1.email
        assert data["role"] == "employee"
        assert data.get("department") is None

    async def test_get_me_returns_admin_schema_with_department_for_admin(
        self, as_user, it_admin_user_1
    ):
        """Returns the IT admin's id, name, email, role=admin and department=it."""

        client = as_user(it_admin_user_1)
        response = client.get("/auth/me")
        data = response.json()

        assert response.status_code == 200
        assert data["id"] == str(it_admin_user_1.id)
        assert data["role"] == "admin"
        assert data["department"] == "it"


@pytest.mark.asyncio
class TestGetCurrentUserProfileRoutes:
    """Tests for GET /auth/profile — full user profile."""

    async def test_get_profile_returns_full_profile_for_employee(
        self, as_user, employee_1
    ):
        """Returns 200 with phone_number, leave_days, created_at and updated_at
        in addition to base identity fields."""

        client = as_user(employee_1)
        response = client.get("/auth/profile")
        data = response.json()

        assert response.status_code == 200
        assert data["id"] == str(employee_1.id)
        assert data["phone_number"] == employee_1.phone_number
        assert data["leave_days"] == employee_1.leave_days
        assert "created_at" in data
        assert "updated_at" in data

    async def test_get_profile_returns_full_profile_for_admin(
        self, as_user, hr_admin_user_1
    ):
        """Returns 200 with department populated for an admin user profile."""

        client = as_user(hr_admin_user_1)
        response = client.get("/auth/profile")
        data = response.json()

        assert response.status_code == 200
        assert data["department"] == "hr"
        assert data["leave_days"] == hr_admin_user_1.leave_days
