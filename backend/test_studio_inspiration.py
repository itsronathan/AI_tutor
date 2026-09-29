import base64
from types import SimpleNamespace

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from openai import OpenAIError

import studio_inspiration as feature
from test_studio_routes import BRIEF, followup

DIRECTION = {"title": "Courtyard", "idea": "Explore a sheltered court.",
             "requirement_connection": "Study the pavilion in sections.",
             "supporting_quotes": ["Design a community pavilion."],
             "trade_off": "Less enclosed area.", "experiment": "Fold two paper models.",
             "unresolved": "Confirm site boundaries."}


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(feature.router)
    return TestClient(app)


def test_inspiration_records_context_and_three_directions(client, monkeypatch):
    calls = []
    def fake(schema, prompt, payload):
        calls.append(payload)
        return schema(directions=[DIRECTION] * 3)
    monkeypatch.setattr(feature, "structured_reply", fake)
    response = client.post("/api/studio/inspiration", json=followup(review_notes="Use riverbank", clarifications=[{"question": "Site?", "answer": "Riverbank"}]))
    assert response.status_code == 200
    assert len(response.json()["directions"]) == 3
    assert response.json()["record"]["provider"] == "OpenAI"
    assert "Riverbank" in response.json()["record"]["input"]
    assert calls[0]["brief"] == BRIEF


@pytest.mark.parametrize("path", ["inspiration", "concept-drawing"])
def test_review_gate_blocks_both_generators(client, monkeypatch, path):
    def forbidden(*args, **kwargs):
        raise AssertionError("Provider must not be called")
    monkeypatch.setattr(feature, "structured_reply", forbidden)
    monkeypatch.setattr(feature, "require_openai_client", forbidden)
    data = followup(reviewed=False)
    if path == "concept-drawing": data.update(direction=DIRECTION, drawing_type="parti")
    assert client.post("/api/studio/" + path, json=data).status_code == 409


def test_invented_inspiration_quote_rejected(client, monkeypatch):
    monkeypatch.setattr(feature, "structured_reply", lambda schema, *args: schema(directions=[{**DIRECTION, "supporting_quotes": ["Invented requirement"]}] * 3))
    assert client.post("/api/studio/inspiration", json=followup()).status_code == 502


@pytest.mark.parametrize("kind", ["parti", "bubble", "massing", "perspective"])
def test_drawing_prompt_settings_and_png(client, monkeypatch, kind):
    calls = []
    png = base64.b64encode(b"\x89PNG\r\n\x1a\nmock-image").decode()
    class Fake:
        def with_options(self, **options):
            assert options == {"max_retries": 0, "timeout": 180.0}
            return self
        @property
        def images(self): return self
        def generate(self, **args):
            calls.append(args)
            return SimpleNamespace(data=[SimpleNamespace(b64_json=png)])
    monkeypatch.setattr(feature, "require_openai_client", lambda: Fake())
    response = client.post("/api/studio/concept-drawing", json=followup(direction=DIRECTION, drawing_type=kind, refinement="More open", review_notes="Keep the tree."))
    assert response.status_code == 200
    assert response.json()["image"].endswith(png)
    assert calls[0]["n"] == 1 and calls[0]["output_format"] == "png"
    assert "NOT TO SCALE" in calls[0]["prompt"]
    if kind == "perspective": assert "exterior perspective concept sketch" in calls[0]["prompt"]
    assert "More open" in calls[0]["prompt"] and "Keep the tree." in calls[0]["prompt"]
    assert response.json()["record"]["prompt"] == calls[0]["prompt"]


@pytest.mark.parametrize("failure", [HTTPException(503, "secret"), OpenAIError("secret")])
def test_drawing_errors_never_expose_provider_details(client, monkeypatch, failure):
    def fail(): raise failure
    monkeypatch.setattr(feature, "require_openai_client", fail)
    response = client.post("/api/studio/concept-drawing", json=followup(direction=DIRECTION, drawing_type="parti"))
    assert response.status_code in (502, 503)
    assert "secret" not in response.text


def test_rejects_bad_type_stale_brief_and_unsupported_quote(client):
    for data, expected in [
        (followup(direction=DIRECTION, drawing_type="construction"), 422),
        (followup(direction=DIRECTION, drawing_type="parti", brief="Changed"), 409),
        (followup(direction={**DIRECTION, "supporting_quotes": ["Invented"]}, drawing_type="parti"), 502),
    ]:
        assert client.post("/api/studio/concept-drawing", json=data).status_code == expected


def test_rejects_missing_or_non_png_image(client, monkeypatch):
    class Fake:
        def with_options(self, **kwargs): return self
        @property
        def images(self): return self
        def generate(self, **kwargs):
            return SimpleNamespace(data=[SimpleNamespace(b64_json=base64.b64encode(b"not a png").decode())])
    monkeypatch.setattr(feature, "require_openai_client", lambda: Fake())
    assert client.post("/api/studio/concept-drawing", json=followup(direction=DIRECTION, drawing_type="bubble")).status_code == 502
