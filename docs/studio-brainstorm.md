# Studio Brainstorm

Open `/studio` from Home or the sidebar. This architecture prototype helps students
start a semester assignment, explore several ideas, and prepare for critiques.
It works without a backend or AI API key. Its exercises are authored prompts, not
AI-generated concepts, instructor feedback, or a grading rubric.

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
and translated sidebar labels. PDF/image upload, AI suggestions, cloud storage,
multi-project management, and course-specific rubrics remain future work.

## Validation

From `frontend`, run `npm run test:run -- src/StudioBrainstorm.test.tsx src/studio`
and `npm run build`. Component tests cover restoration, partial autosaving, storage
failures, tool switching, concept removal, and the review/export workflow. Utility
tests cover migration, date handling, reference URLs, and export content.

For manual review, try the tools in order, refresh after edits, and compare a few
concepts on a narrow viewport. The table scrolls horizontally; the rest of the
workspace stacks. Verify that the downloaded notes contain the project's current
state. No AI service is called.

## Next milestone

Test the workflow with architecture students. Then connect briefs to
architecture-specific follow-up questions and concept directions, each grounded
in the assignment and accompanied by assumptions and an experiment. Keep studio
requests separate from the existing math-specific textbook tutor.
