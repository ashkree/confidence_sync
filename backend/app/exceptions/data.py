class DataError(Exception):
    """Base class for data errors."""


class RecordNotFoundError(DataError):
    """Error for missing database entries"""
