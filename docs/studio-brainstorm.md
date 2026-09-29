# Studio Brainstorm

## Zoning, accessibility and lighting studies

The existing Learn tab now includes **Zoning and safety codes**, **ADA and accessible
design**, and **Lighting strategies** alongside the four introductory lessons.
Each new topic includes a design exercise, a project study worksheet, official
source links checked September 29, 2026, and up to 8,000 characters of working notes.
Notes autosave per topic and owner, survive assignment changes, and appear in the
notebook export even without a reflection or completion check. Revisit them when
the project changes. Older drafts receive empty notes for the new topics.

Zoning and safety research separates land-use rules from building-code questions.
NYC source links relate to the Greenpoint syllabus example; students must establish
their project's jurisdiction, applicable edition, and scope. The accessibility
worksheet traces arrival and participation, including pool facilities when relevant,
and links to DOJ's 2010 ADA Standards. Lighting compares daylight, glare, shading,
electric light and controls through two alternatives, with a DOE source.

These are educational research tools, not automated compliance checks, dimensional
validators, or lighting simulations. The tutor includes the chosen lesson in its
question context after assignment review, but has no live code lookup and does not
automatically receive worksheet notes. Students can paste relevant excerpts into a
question. Backend instructions require missing project conditions and source excerpts
to be identified rather than inventing code limits or measured performance.

Open `/studio` from Home or the sidebar. This architecture prototype helps students
start a semester assignment, explore several ideas, and prepare for critiques.
The local project tools work without a backend or AI API key. Assignment analysis
and the assignment tutor use the AI backend. The brainstorming exercises remain
authored prompts, and starter lists are not an instructor's grading rubric.

## Analyze an assignment before asking questions

1. Paste the complete assignment in **Assignment brief**, then select **Analyze assignment**.
2. Read the AI summary and extracted requirements. Each requirement includes a
   supporting quote from the brief. The server verifies that the quote occurs in
   the source; the student still needs to check whether the interpretation is correct.
3. Add corrections or additional context and mark the requirements as reviewed.
4. Answer clarification questions as information becomes available. Questions for
   the instructor are labeled separately from student design choices. Unanswered
   questions can remain open.
5. Ask the **assignment tutor** about deliverables, constraints, or what to explore
   next. It receives the original brief, reviewed analysis, corrections, answers,
   and the most recent six conversation turns. The prompt asks it to identify
   missing information and distinguish design possibilities from actual requirements.

AI analysis, clarification answers, and the last 20 Q&A turns are saved with the
local draft and included in the text export. Changing the brief clears that AI
context and requires a fresh review; other project notes remain. Requests can be
canceled and time out in the browser after two minutes. Switching tools cancels
an in-progress request. Responses from old briefs are discarded.

Analysis sends the brief to the configured AI service. Follow-up requests also
send the reviewed analysis, corrections, clarifications, and recent conversation.
The studio endpoints are stateless and do not require MongoDB. They follow the
existing app's guest-access model; deployers should use their existing API access
and usage controls. There is no simulated success fallback when AI is unavailable.

### Local AI setup

Install `backend/requirements.txt` in a Python environment. Configure
`OPENAI_API_KEY` in `backend/.env` (the existing `API_KEY` alias also works).
Never add the real key to Git or to frontend environment variables. Optionally
set `STUDIO_MODEL`; it defaults to `gpt-5.2`, matching the existing tutor. An override
must support Chat Completions and strict JSON Schema outputs.

Run `uvicorn main:app --host 127.0.0.1 --port 8000` from `backend`.
For local frontend development, set `DEV_API_PROXY_TARGET=http://127.0.0.1:8000`
in the frontend shell or its ignored `.env.local`, then restart `npm run dev`.
Otherwise the existing Vite default points to the hosted API, which needs this
backend change deployed before the new endpoints are available. For production,
deploy the backend and frontend together using the existing API origin configuration.

The endpoints are `POST /api/studio/analyze` and `POST /api/studio/follow-up`.
Provider calls reuse the existing OpenAI helper with
[Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).
Missing credentials, provider failures, incomplete responses, invalid output,
and unsupported source quotes return errors rather than fabricated analysis.

## Tools

- **Brief & exercises:** paste a brief, record interests and intended experience,
  and expand the site/people/requirements fields. Keep requirements from the brief
  separate from assumptions and questions for the instructor. Ten exercises across
  People, Site, Light, Movement, and Material each include a small drawing or model
  experiment and a saved response.
- **Concepts:** create up to 12 concept cards with a premise, spatial moves, and
  a next experiment. Compare up to three and optionally choose a current direction.
  Record trade-offs in decision notes. Removing a concept clears its selection.
- **References:** keep up to 30 sources with observations and possible applications.
  HTTP(S) URLs can be opened; book citations stay as text. Sources are student-provided,
  not automatically retrieved or verified.
- **Plan:** create up to 50 milestones with optional local calendar dates and completion.
  An editable starter list is available when the list is empty. Dates come from the student.
- **Review & export:** write a short project story and questions for review; customize
  a presentation checklist (up to 40 items); record up to 50 critiques with feedback,
  interpretation, and follow-up actions. Download all project notes as a plain-text file,
  or copy the preview if downloads are unavailable. The export is a snapshot, not an
  importable backup.

## Saving and limits

### Course preset, inspiration and concept drawings

In **Brief & exercises**, open the optional ARCH 4820 Fall 2026 preset and preview
the summary before adding it. It is curated from the supplied `CD1 Syllabus_Fall
2026.pdf` and includes page references; it is not a complete PDF import or a claim
that instructor updates are reflected. The PDF itself is not published with the app.
The preset appends to existing brief text and clears its prior review/conversation.
Duplicate application is disabled, and the 30,000-character brief limit is checked.
Model scales, grading weights, land-use extent, circulation percentages, and phase
numbering differences remain explicitly unresolved.

In **Concepts**, review the current assignment before generating three directions.
Each AI suggestion includes its connection to requirements, source quotes checked
against the brief, a trade-off, an experiment and an unresolved question. Suggestions
are not researched precedents. Add a direction to the editable concept board to
develop it or compare it with other concepts. AI starting points retain a label.
Changes to the brief, review status, corrections or clarification answers make
previous directions historical; regenerate against the updated context.

Open **Create concept images** from Learn, or find **Generate images** in Concepts.
The controls are visible before generation and explain the required assignment review
and direction selection. Choose a direction and request one optional parti, program
bubble diagram, rough massing illustration, or exterior perspective concept sketch.
A refinement requests a new interpretation, not pixel edits
to an earlier image. Images are exploratory and not verified scaled drawings,
regulatory checks, engineering proposals or substitutes for physical models.
PNG images remain only in memory while the panel is open: download them before
navigating away. JSON/text process exports do not embed images.

The latest 12 successful inspiration/drawing records autosave locally, retaining
input snapshots, instructions, provider/model, timestamps, text outputs and image
settings. Download JSON in Concepts or include records in the project notebook
export. Image filenames carry their record ID. Export regularly before older records
roll off. Failed/canceled calls and activity in other AI tools are not recorded.
Canceled browser requests may still complete and incur costs at the provider.

Backend routes: `/api/studio/inspiration` and `/api/studio/concept-drawing`.
Text uses the existing `STUDIO_MODEL`; images use `STUDIO_IMAGE_MODEL` (default
`gpt-image-1`) with one 1024x1024, low-quality PNG per explicit request. A compatible
image model and API access are required. Configure `OPENAI_API_KEY` on the backend;
never place it in a frontend environment variable. Both app and backend must be
deployed. Requests send the reviewed assignment, notes, clarification answers and
student focus; drawing requests additionally send the chosen direction/refinement.
There are no automatic image retries. Backend image timeout is 180 seconds; client
timeout is 200 seconds. Oversized drawing prompts return a clear error.
See the [official image API guide](https://developers.openai.com/api/docs/guides/image-generation).

Run backend coverage with `python -m pytest test_studio_routes.py test_studio_inspiration.py`.
Provider responses are mocked in tests; live generation needs a configured account
and separate quality review. These prototype endpoints use the app's existing guest
access model; deployment operators should apply their normal usage/access controls.

### Architecture Learning Mode

Choose **Architectural Design Studio** in the Learning Mode selector, open
`/learning?course=architecture`, or select **Learn** in Studio Brainstorm.
Textbook learning remains the default at `/learning`.

Four introductory lessons cover site analysis, circulation and arrival, scale and
human experience, and spatial organization. Each contains an explanation, a possible
example, a short sketch/model exercise, and a reflection prompt. These are authored
general learning materials, not an RPI syllabus or official project requirements.
Lessons work without a backend or AI key. Completion is self-reported, not graded.

Learning and Studio use the same owner-scoped local project. Reflections and
completion checkboxes autosave and appear in the notebook export. They remain when
the brief changes so students can revisit earlier work against new requirements.

After assignment review, the lesson tutor reuses `/api/studio/follow-up`, sending
the selected concept and exercise with the question, original brief, corrections,
clarification answers, and recent conversation. It asks for an explanation, an
experiment, and a reflection question. Saved reflections are not sent automatically;
students can include observations in their question. Replies join the existing
Studio conversation. Switching lessons cancels pending requests. Without a reviewed
brief, a button directs students to assignment setup instead of guessing context.
The existing textbook progress sidebar is separate from the lesson checklist.

Edits save immediately to one local draft per user ID, or to a shared guest draft.
Blank briefs and incomplete ideas can be saved automatically. The explicit save
button requires a nonblank brief and displays its summary. Signing in switches to
that account's local draft; it does not transfer the guest draft. Drafts do not sync
between devices. Local storage is not a security boundary, and guest drafts are
shared by people using this browser. Export notes before clearing browser storage.

The original `studio-brainstorm:v1:<ownerId>` key is retained. New fields default
safely when older drafts are loaded; malformed entries are normalized. Storage
failures appear above every tool; editing and exporting still work in memory.
Text fields and collection lengths are capped to keep browser drafts manageable.

This prototype supports one project per account/browser, English page content,
and translated sidebar labels. PDF/image upload, cloud storage,
multi-project management, and course-specific rubrics remain future work.

## Validation

From `frontend`, run `npm run test:run -- src/LearningMode.test.tsx src/StudioBrainstorm.test.tsx src/studio`
and `npm run build`. From `backend`, run `python -m pytest test_studio_routes.py`.
The assignment tests stub the AI provider; passing tests do not verify live model
quality or API access. Component tests cover restoration, partial autosaving, storage
failures, tool switching, concept removal, and the review/export workflow. Utility
tests cover migration, date handling, reference URLs, and export content.

For manual review, try the tools in order, refresh after edits, and compare a few
concepts on a narrow viewport. The table scrolls horizontally; the rest of the
workspace stacks. Verify that the downloaded notes contain the project's current
state. For a live AI smoke test, configure the backend key, paste a short test
assignment, review it, answer one clarification, and ask a follow-up. Editing the
brief should clear the previous analysis and disable follow-up until a new review.

## Next milestone

Test analysis quality and the workflow with architecture students. Future concept
generation should keep requirements separate from suggestions and include a small
experiment for each proposed direction. Keep studio requests separate from the
existing math-specific textbook tutor.
