// Bootstrapping, observers and URL-change handling

let chtInitialized = false;
let chtObserver = null;
let chtRescanTimeout = null;

function handleMutations(mutations) {
  for (const m of mutations) {
    if (m.type === "childList" && (m.addedNodes?.length || m.removedNodes?.length)) {
      scheduleRescan();
      break;
    }
  }
}

function scheduleRescan() {
  if (chtRescanTimeout) {
    clearTimeout(chtRescanTimeout);
  }
  chtRescanTimeout = setTimeout(() => {
    chtRescanTimeout = null;
    scanForQuestions();
  }, 400);
}

function setupObserver() {
  if (chtObserver) return;
  chtObserver = new MutationObserver(handleMutations);
  chtObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function handleUrlChange() {
  clearSidebar();
  // Reset attributes on question elements; we'll rescan with fresh IDs.
  document.querySelectorAll("[" + QUESTION_ATTR + "]").forEach((el) => {
    el.removeAttribute(QUESTION_ATTR);
  });
  scanForQuestions();
}

function setupUrlWatcher() {
  let lastUrl = location.href;
  setInterval(() => {
    const current = location.href;
    if (current !== lastUrl) {
      lastUrl = current;
      handleUrlChange();
    }
  }, 800);
}

async function initChatHistoryTracker() {
  if (chtInitialized) return;
  if (!detectPlatform()) return;
  chtInitialized = true;

  await createSidebar();
  scanForQuestions();
  setupObserver();
  setupUrlWatcher();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initChatHistoryTracker);
} else {
  initChatHistoryTracker();
}

