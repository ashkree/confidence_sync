import pytest
from app.services.users import to_user_base, to_user_profile
from app.schemas.users import Employee, Admin, UserProfile

class TestToUserBase:
    """Tests the mapping from User model to UserBase schemas."""

    def test_maps_employee_correctly(self, employee_1):
        schema = to_user_base(employee_1)
        
        assert isinstance(schema, Employee)
        assert schema.id == str(employee_1.id)
        assert schema.name == employee_1.name
        assert schema.email == employee_1.email
        assert schema.role == "employee"
        assert getattr(schema, "department", None) is None

    def test_maps_admin_correctly(self, it_admin_user_1):
        schema = to_user_base(it_admin_user_1)
        
        assert isinstance(schema, Admin)
        assert schema.id == str(it_admin_user_1.id)
        assert schema.name == it_admin_user_1.name
        assert schema.email == it_admin_user_1.email
        assert schema.role == "admin"
        assert schema.department == "it"

    def test_raises_value_error_if_admin_has_no_department(self, hr_admin_user_1):
        # Temporarily unset the department
        hr_admin_user_1.department = None
        
        with pytest.raises(ValueError) as exc:
            to_user_base(hr_admin_user_1)
            
        assert f"Admin user {hr_admin_user_1.id} has no department set" in str(exc.value)

class TestToUserProfile:
    """Tests the mapping from User model to UserProfile schemas."""

    def test_maps_employee_profile_correctly(self, employee_1):
        profile = to_user_profile(employee_1)
        
        assert isinstance(profile, UserProfile)
        assert profile.id == str(employee_1.id)
        assert profile.role == "employee"
        assert getattr(profile, "department", None) is None
        assert profile.phone_number == employee_1.phone_number
        assert profile.leave_days == employee_1.leave_days
        assert profile.created_at == employee_1.created_at
        assert profile.updated_at == employee_1.updated_at

    def test_maps_admin_profile_correctly(self, it_admin_user_1):
        profile = to_user_profile(it_admin_user_1)
        
        assert isinstance(profile, UserProfile)
        assert profile.id == str(it_admin_user_1.id)
        assert profile.role == "admin"
        assert profile.department == "it"
        assert profile.phone_number == it_admin_user_1.phone_number
        assert profile.leave_days == it_admin_user_1.leave_days
        assert profile.created_at == it_admin_user_1.created_at
        assert profile.updated_at == it_admin_user_1.updated_at
