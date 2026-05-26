# Python lesson fallback video metadata plan

## Current state
- All Python lessons currently have bespoke module specs in `LESSON_MODULES` (`py-b1..py-b5`, `py-c1..py-c5`).
- Lessons without a spec go through `getResolvedLessonModule(...)`, which returns fallback content and `video: null`.

## Lightweight implementation proposal
1. Add `LESSON_VIDEO_FALLBACKS` keyed by lesson id:
   - `youtubeId`
   - `title`
   - `channel`
   - optional `startSeconds`
   - optional `fallbackMarkdown`
2. In `getResolvedLessonModule(...)`, after building fallback, attach `video` from the map when present.
3. If `fallbackMarkdown` exists in the map, use it instead of generic `fallbackDeepDive(...)`.

This allows per-lesson video curation without writing full bespoke modules.
