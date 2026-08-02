import uuid
import pytest
from pydantic import TypeAdapter, ValidationError

from app.schemas.tickets import TicketCreate, ItTicketCreate, HrRequestCreate, TicketCommentCreate
from app.models.it_ticket import ItTicket
from app.models.hr_request import HrRequest
from app.models.ticket_comment import TicketComment

class TestTicketCreateDiscriminator:
    """Tests the TicketCreate discriminated union."""

    def test_parses_it_ticket_correctly(self):
        payload = {
            "type": "it_ticket",
            "subject": "My mouse is broken",
            "description": "Scroll wheel doesn't work",
            "request_type": "hardware_issue",
            "device_type": "Mouse"
        }
        # TypeAdapter handles the discriminator validation
        adapter = TypeAdapter(TicketCreate)
        parsed = adapter.validate_python(payload)
        
        assert isinstance(parsed, ItTicketCreate)
        assert parsed.subject == "My mouse is broken"
        assert parsed.device_type == "Mouse"

    def test_parses_hr_request_correctly(self):
        payload = {
            "type": "hr_request",
            "subject": "Leave Request",
            "description": "Taking PTO",
            "request_type": "leave_request"
        }
        adapter = TypeAdapter(TicketCreate)
        parsed = adapter.validate_python(payload)
        
        assert isinstance(parsed, HrRequestCreate)
        assert parsed.request_type == "leave_request"

    def test_rejects_invalid_discriminator_type(self):
        payload = {
            "type": "facilities_ticket", # Invalid type
            "subject": "Fix AC",
            "description": "It is too cold"
        }
        adapter = TypeAdapter(TicketCreate)
        
        with pytest.raises(ValidationError) as exc:
            adapter.validate_python(payload)
        
        # Ensure it complained about the discriminator
        assert "Input tag 'facilities_ticket' found using 'type' does not match any of the expected tags" in str(exc.value)

class TestSchemaToOrm:
    """Tests that schemas successfully map to SQLAlchemy models."""

    def test_it_ticket_to_orm(self):
        poster_id = uuid.uuid4()
        schema = ItTicketCreate(
            type="it_ticket",
            subject="IDE Crash",
            description="VSCode crashing on save",
            request_type="software_issue",
            software_name="VSCode"
        )
        
        db_model = schema.to_orm(poster_id)
        
        assert isinstance(db_model, ItTicket)
        assert db_model.poster_id == poster_id
        assert db_model.subject == "IDE Crash"
        assert db_model.request_type == "software_issue"
        assert db_model.software_name == "VSCode"

    def test_ticket_comment_create_to_orm(self):
        ticket_id = uuid.uuid4()
        author_id = uuid.uuid4()
        
        schema = TicketCommentCreate(body="Looking into this now.")
        db_model = schema.to_orm(ticket_id=ticket_id, author_id=author_id)
        
        assert isinstance(db_model, TicketComment)
        assert db_model.ticket_id == ticket_id
        assert db_model.author_id == author_id
        assert db_model.body == "Looking into this now."
