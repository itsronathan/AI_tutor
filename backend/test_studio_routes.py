"""Studio routes use a stubbed provider: no API credentials or network calls."""
import json
from types import SimpleNamespace

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

import studio_routes as studio

BRIEF = "Design a community pavilion. Submit two sections and a site model by October 20."
ANALYSIS = {
    "summary": "Design a pavilion and communicate it through sections and a site model.",
    "requirements": [{"category": "deliverable", "requirement": "Submit two sections and a site model.",
                      "quote": "Submit two sections and a site model by October 20."}],
    "questions": [{"question": "What site should be used?", "reason": "The brief does not name a site.", "ask": "instructor"}],
}
REPLY = {"answer": "Start with a site model and use sections to explore enclosure.",
         "supporting_quotes": ["Submit two sections and a site model by October 20."], "remaining_questions": []}


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(studio.router)
    return TestClient(app)


def mock_completion(monkeypatch, content, finish="stop", refusal=None):
    calls = []
    def complete(**kwargs):
        calls.append(kwargs)
        return SimpleNamespace(choices=[SimpleNamespace(finish_reason=finish,
            message=SimpleNamespace(content=json.dumps(content), refusal=refusal))])
    monkeypatch.setattr(studio, "create_chat_completion", complete)
    return calls


def followup(**overrides):
    return {"brief": BRIEF, "analysis": {**ANALYSIS, "source_brief": BRIEF}, "reviewed": True,
            "question": "Where should I start?", **overrides}


def test_extracts_requirements_with_quotes_and_binds_source(client, monkeypatch):
    calls = mock_completion(monkeypatch, ANALYSIS)
    response = client.post("/api/studio/analyze", json={"brief": BRIEF})
    assert response.status_code == 200
    assert response.json()["source_brief"] == BRIEF
    assert response.json()["requirements"] == ANALYSIS["requirements"]
    assert calls[0]["response_format"]["json_schema"]["strict"] is True
    assert calls[0]["store"] is False


@pytest.mark.parametrize("brief", ["   ", "x" * 30001])
def test_rejects_empty_or_oversized_brief_without_calling_ai(client, monkeypatch, brief):
    calls = mock_completion(monkeypatch, ANALYSIS)
    assert client.post("/api/studio/analyze", json={"brief": brief}).status_code == 422
    assert not calls


@pytest.mark.parametrize("overrides", [{"reviewed": False}, {"brief": "A different project"}])
def test_followup_requires_review_of_current_brief(client, monkeypatch, overrides):
    calls = mock_completion(monkeypatch, REPLY)
    assert client.post("/api/studio/follow-up", json=followup(**overrides)).status_code == 409
    assert not calls


def test_followup_includes_original_brief_clarifications_and_history(client, monkeypatch):
    calls = mock_completion(monkeypatch, REPLY)
    payload = followup(review_notes="The instructor confirmed a riverside site.",
        clarifications=[{"question": "What site should be used?", "answer": "The riverbank."}],
        history=[{"question": "What should I submit?", "reply": REPLY}])
    response = client.post("/api/studio/follow-up", json=payload)
    assert response.status_code == 200
    context = json.loads(calls[0]["messages"][1]["content"])
    assert context["brief"] == BRIEF
    assert context["clarifications"] == payload["clarifications"]
    assert context["review_notes"] == payload["review_notes"]
    assert context["history"] == payload["history"]


def test_rejects_invented_requirement_quotes(client, monkeypatch):
    mock_completion(monkeypatch, {**ANALYSIS, "requirements": [{**ANALYSIS["requirements"][0], "quote": "Use concrete only."}]})
    assert client.post("/api/studio/analyze", json={"brief": BRIEF}).status_code == 502


def test_rejects_invented_followup_quotes(client, monkeypatch):
    mock_completion(monkeypatch, {**REPLY, "supporting_quotes": ["Use concrete only."]})
    assert client.post("/api/studio/follow-up", json=followup()).status_code == 502


@pytest.mark.parametrize("content,finish,refusal,status", [
    ({}, "stop", None, 502), (ANALYSIS, "length", None, 502), (ANALYSIS, "stop", "Cannot process", 422),
])
def test_handles_invalid_incomplete_and_refused_responses(client, monkeypatch, content, finish, refusal, status):
    mock_completion(monkeypatch, content, finish, refusal)
    assert client.post("/api/studio/analyze", json={"brief": BRIEF}).status_code == status


def test_provider_error_does_not_expose_credentials(client, monkeypatch):
    def unavailable(**kwargs):
        raise HTTPException(503, "authentication error key=secret-fragment")
    monkeypatch.setattr(studio, "create_chat_completion", unavailable)
    response = client.post("/api/studio/analyze", json={"brief": BRIEF})
    assert response.status_code == 503
    assert "secret-fragment" not in response.text
    assert "OPENAI_API_KEY" in response.text
