## Chat History Tracker Sidebar (Chrome Extension)

This Chrome extension injects a small, hoverable sidebar on the right side of ChatGPT, Claude, and Gemini conversations.  
The sidebar lists all of your user messages (questions) in the current chat and lets you click to jump/scroll to that turn.

### Demo

https://github.com/user-attachments/assets/d4753461-6e73-4901-81fa-b60c96facc0e

### Supported sites

- ChatGPT: `https://chat.openai.com/*`, `https://chatgpt.com/*`
- Claude: `https://claude.ai/*`
- Gemini: `https://gemini.google.com/*`

### Features

- Minimal, unobtrusive sidebar pinned to the right edge of the screen.
- On hover, the sidebar expands to show a scrollable list of the questions you asked in the current conversation.
- Clicking an item smoothly scrolls the page to that specific message.
- Automatically updates as you send new messages.
- Resets per-conversation when the URL changes.

### How to load in Chrome

1. Open Chrome and go to `chrome://extensions/`.
2. Toggle **Developer mode** on (top-right).
3. Click **"Load unpacked"**.
4. Select the `chat_track` folder (the folder that contains `manifest.json`).
5. Ensure the extension is enabled.

Then open ChatGPT, Claude, or Gemini in a tab. You should see a thin handle on the right side; hover it to expand the sidebar.

### Notes / Limitations

- The extension uses DOM heuristics to detect user messages. If the providers change their HTML structure, it may miss some messages until selectors are updated.
- The sidebar is hidden on small/mobile viewports (`max-width: 768px`) to avoid clashing with mobile layouts.
- No data is sent anywhere; everything runs entirely in the page as a content script.

