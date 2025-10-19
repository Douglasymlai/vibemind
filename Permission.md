## Permissions Justification — Vibe Mind (Chrome Extension)

This document explains why each requested permission is needed based on the current implementation in `extension/` and the details in `STORE_LISTING.md`.

### activeTab
- Purpose: Enables injecting UI elements and reading selected text on supported sites when the user interacts with the extension.
- Usage in code: Content scripts (`content.js`) run on specific matches (`v0.dev`, `v0.app`, `magicpatterns.com`, `lovable.dev`) to enhance prompts and UI interactions.
- Privacy: Only used on the matched domains; no blanket access to all sites.

### storage
- Purpose: Persist user preferences and API key locally.
- Usage in code: The OpenAI API key and lightweight state (e.g., last profile, cache hints) are stored via Chrome storage APIs for a better user experience.
- Privacy: Keys and settings stay on the user’s device; not sent or synced unless explicitly used in a request by the user.

### clipboardWrite
- Purpose: Allow one-click copy of generated/enhanced prompts.
- Usage in code: "Copy" actions in the side panel and content UI write the enhanced prompt to the clipboard.
- Privacy: Only writes user-requested text; never reads from the clipboard.

### contextMenus
- Purpose: Provide right‑click menu actions (e.g., enhance selected text, analyze image).
- Usage in code: Registers context menu items to streamline workflow from page content to the extension.
- UX: Reduces steps needed to send selection/image to the side panel and backend.

### notifications
- Purpose: Show success/error toasts for operations like enhancement completion, copy success, or errors.
- Usage in code: Notifies users about request status and actionable results without interrupting the page.
- UX: Non-intrusive feedback; no tracking.

### scripting
- Purpose: Safely inject and manage scripts/styles on supported pages.
- Usage in code: Injects/communicates with `content.js` and applies `content.css` to render buttons and UI affordances on the target sites.
- Security: Bound to declared `matches` (no arbitrary site injection).

### sidePanel
- Purpose: Display the main Vibe Mind interface in Chrome’s side panel.
- Usage in code: `sidepanel.html`/`sidepanel.js` compose the primary UI for entering text, uploading images, and viewing results.
- UX: Keeps the tool accessible alongside target websites without popups.

### management
- Purpose: Detect when the extension is disabled to clean up listeners/resources.
- Usage in code: Listens to `chrome.management.onDisabled` in `background.js` to perform cleanup.
- Note: If this minimal lifecycle handling is not critical, we can remove `management` to further reduce requested permissions.

---

## Host Permissions

The manifest currently declares host permissions for API origins used for network requests. These do not grant content access to arbitrary sites; they scope which origins the extension may call if required by Chrome policy/CORS strategy.

### https://vibemind-production.up.railway.app/*
- Purpose: Communicate with our backend API (`API_BASE_URL`/`API_ROOT_URL` from `config.js`) for prompt enhancement, image analysis, health checks, and shutdown in dev flows.
- Usage in code: `sidepanel.js`, `background.js`, and parts of `content.js` perform `fetch` calls to endpoints such as `/api/analyze`, `/api/analyze-upload`, `/api/health`, etc.
- Note: If the server sets appropriate CORS headers and we proxy content‑script requests through the background, we can operate without declaring this host permission. Keeping it simplifies direct calls from UI surfaces if needed.

### https://api.openai.com/*
- Current usage: The extension code in `extension/` does not call OpenAI directly; calls go through our backend. This host permission is therefore not required by the current implementation and can be removed.
- If retained intentionally: Justification would be to enable direct client‑side calls to OpenAI (BYOK) in a future version. For now, recommend removing to minimize permission surface.

---

## Remote Code Usage

- Remotely hosted code: Not used. All executable JavaScript is packaged within the extension (e.g., `content.js`, `sidepanel.js`, `background.js`, and vendored `lottie.min.js`). The extension does not fetch and execute remote JavaScript, nor does it use `eval`/dynamic code execution.
- Remote network access: Used for data only (JSON/form-data) to our backend at `vibemind-production.up.railway.app`. No executable code is downloaded or run from these responses.
- Third‑party libraries: `lottie.min.js` is bundled locally and shipped with the extension package.

---

## Summary of Minimization

- Host permissions: Keep only `vibemind-production.up.railway.app` if needed for direct calls; remove `api.openai.com` since the extension does not call it directly.
- `management`: Optional; can be removed if on‑disable cleanup is not required.
- All other permissions are narrowly tailored to deliver the side panel UI, on‑page helpers, and clipboard/context menu features described in `STORE_LISTING.md`.


