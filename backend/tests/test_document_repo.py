import inspect
from app.config import settings
from app.repository.document import DocumentRepo


def test_retrieval_distance_threshold_setting():
    assert hasattr(settings, "retrieval_distance_threshold")
    assert settings.retrieval_distance_threshold == 0.6


def test_cosine_distance_default_threshold():
    sig = inspect.signature(DocumentRepo.cosine_distance)
    assert "threshold" in sig.parameters
    assert sig.parameters["threshold"].default == settings.retrieval_distance_threshold
