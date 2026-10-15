import fitz
from test_studio_routes import client  # noqa: F401


def pdf(text="Design a courtyard pavilion.", pages=1):
    with fitz.open() as doc:
        for _ in range(pages):
            page = doc.new_page()
            if text:
                page.insert_text((72, 72), text)
        return doc.tobytes()


def test_import_extracts_text_without_ai(client):
    response = client.post("/api/studio/import-pdf", content=pdf(), headers={"Content-Type": "application/pdf"})
    assert response.status_code == 200
    assert response.json()["text"] == "Design a courtyard pavilion."


def test_unreadable_and_oversized_files(client):
    for data in (b"not pdf", pdf(""), pdf(pages=41)):
        assert client.post("/api/studio/import-pdf", content=data).status_code == 422
    assert client.post("/api/studio/import-pdf", content=b"x" * (10 * 1024 * 1024 + 1)).status_code == 413


def test_warns_about_missing_page_text(client):
    with fitz.open(stream=pdf(), filetype="pdf") as doc:
        doc.new_page()
        response = client.post("/api/studio/import-pdf", content=doc.tobytes())
    assert response.status_code == 200
    assert "pages 2" in response.json()["warning"]
