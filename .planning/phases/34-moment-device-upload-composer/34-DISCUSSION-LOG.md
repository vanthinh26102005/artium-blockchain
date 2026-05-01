# Phase 34: Moment device upload composer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-01T01:26:47Z
**Phase:** 34-Moment device upload composer
**Areas discussed:** Upload Timing, Composer Layout, Required Fields, Failure And Replace

---

## Upload Timing

| Option | Description | Selected |
|--------|-------------|----------|
| Upload on file select | Upload immediately after file selection so progress, retry, and publish-disabled states are visible early. | ✓ |
| Upload on publish | Upload only when the user clicks publish, reducing abandoned upload calls but making publish slower and failure later. | |
| You decide | Let the agent choose based on Phase 33 API and Orders-style state model. | |

**User's choice:** Upload on file select.
**Notes:** Publish should remain disabled until upload succeeds and a `mediaId` exists.

### Follow-up: editing during upload

| Option | Description | Selected |
|--------|-------------|----------|
| Edit metadata during upload | Caption/location/hashtags/pin can be edited while progress runs; only Publish stays disabled. | ✓ |
| Lock the full form during upload | Simpler state handling, but slower and less polished. | |
| You decide | Let the agent choose. | |

**User's choice:** Edit metadata during upload.
**Notes:** File replacement and publish can still be gated by upload state.

---

## Composer Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Orders-style two-zone modal | Upload preview/status zone plus metadata form, using restrained white panels and responsive stacking. | ✓ |
| Keep current dramatic split modal | Reuses current dark gradient modal but conflicts with Orders-aligned direction and pasted-link removal. | |
| Inline composer in Moments section | More immediate but more invasive to profile layout. | |

**User's choice:** Orders-style two-zone modal.
**Notes:** Upload preview/status is primary; metadata form is secondary.

### Follow-up: empty upload state

| Option | Description | Selected |
|--------|-------------|----------|
| Dropzone with file picker button | Clear single-file target with accepted type/limit copy; click and drag/drop if straightforward. | ✓ |
| Simple file input button only | Less UI work, less polished. | |
| You decide | Let the agent choose. | |

**User's choice:** Dropzone with file picker button.
**Notes:** Must accept exactly one image or video.

---

## Required Fields

| Option | Description | Selected |
|--------|-------------|----------|
| Only uploaded media is required | Caption, location, hashtags, pinning, duration, and tagged artwork metadata stay optional. | ✓ |
| Media plus caption required | Encourages richer moments but adds friction. | |
| Media plus caption and location required | Stronger structure but too restrictive for quick profile moments. | |

**User's choice:** Only uploaded media is required.
**Notes:** Successful upload is the only publish blocker beyond auth/submission state.

### Follow-up: hashtags

| Option | Description | Selected |
|--------|-------------|----------|
| Comma-separated text input | Matches current UI and keeps Phase 34 scoped. | ✓ |
| Chip editor | More polished but adds input/removal behavior. | |
| You decide | Let the agent choose. | |

**User's choice:** Comma-separated text input.
**Notes:** Chip editor deferred.

---

## Failure And Replace

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve metadata | Keep caption/location/hashtags/pin; retry or replace only the file. | ✓ |
| Reset the whole form | Simpler but loses user work. | |
| You decide | Let the agent choose. | |

**User's choice:** Preserve metadata.
**Notes:** Upload failure affects file/upload state only.

### Follow-up: replacing uploaded file

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve metadata, clear old mediaId | Keep text fields, clear previous `mediaId`, upload new file, block publish until success. | ✓ |
| Reset metadata too | Cleaner state but loses user work. | |
| Ask each time | Adds friction inside a simple composer. | |

**User's choice:** Preserve metadata, clear old mediaId.
**Notes:** Replacement upload is treated as the active media proof.

---

## the agent's Discretion

- Exact component/hook boundaries.
- Exact progress/status chip styling.
- Whether drag/drop is implemented with native events or a simple input wrapper.
- Local preview object URL lifecycle details.

## Deferred Ideas

- Moodboard multi-upload composer and gallery polish are Phase 35.
- Hashtag chip editor is deferred.
- Pending uploaded-media cleanup/delete API is deferred unless already available.
