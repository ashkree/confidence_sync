import datetime
import uuid

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    file_name: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
