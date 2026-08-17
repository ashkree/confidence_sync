import datetime
import uuid
from typing import Literal

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    category: Literal["HR_POLICY", "IT_MANUAL"]
    url: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
