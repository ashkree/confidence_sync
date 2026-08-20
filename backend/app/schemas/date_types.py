from datetime import date, datetime
from typing import Annotated, Any
from pydantic import BeforeValidator, PlainSerializer


def parse_dd_mm_yyyy_datetime(v: Any) -> Any:
    if isinstance(v, str):
        for fmt in (
            "%d/%m/%Y",
            "%d/%m/%Y %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%d",
        ):
            try:
                return datetime.strptime(v, fmt)
            except ValueError:
                continue
    return v


def parse_dd_mm_yyyy_date(v: Any) -> Any:
    if isinstance(v, str):
        for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
            try:
                return datetime.strptime(v, fmt).date()
            except ValueError:
                continue
    return v


FormattedDateTime = Annotated[
    datetime,
    BeforeValidator(parse_dd_mm_yyyy_datetime),
    PlainSerializer(
        lambda dt: dt.strftime("%d/%m/%Y") if dt is not None else None,
        return_type=str | None,
        when_used="json",
    ),
]

FormattedDate = Annotated[
    date,
    BeforeValidator(parse_dd_mm_yyyy_date),
    PlainSerializer(
        lambda d: d.strftime("%d/%m/%Y") if d is not None else None,
        return_type=str | None,
        when_used="json",
    ),
]
