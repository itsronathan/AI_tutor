from fastapi import HTTPException
import studio_routes


def test_availability_reports_configured_without_provider_call(monkeypatch):
    monkeypatch.setattr(studio_routes, "require_openai_client", lambda: object())
    assert studio_routes.studio_availability() == {"configured": True}


def test_availability_does_not_return_credentials_or_internal_errors(monkeypatch):
    def missing():
        raise HTTPException(503, "private configuration details")
    monkeypatch.setattr(studio_routes, "require_openai_client", missing)
    assert studio_routes.studio_availability() == {"configured": False}
