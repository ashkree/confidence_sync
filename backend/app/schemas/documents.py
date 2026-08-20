import uuid

from pydantic import BaseModel, ConfigDict

from app.schemas.date_types import FormattedDateTime


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    file_name: str
    created_at: FormattedDateTime
    updated_at: FormattedDateTime
