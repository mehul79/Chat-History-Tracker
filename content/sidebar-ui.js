// Sidebar UI primitives and question list rendering

const SIDEBAR_ID = "cht-sidebar";
const SIDEBAR_ITEM_CLASS = "cht-sidebar-item";
const QUESTION_ATTR = "data-cht-question-id";

let nextQuestionId = 1;
const questionMap = new Map(); // id -> HTMLElement

async function createSidebar() {
  if (document.getElementById(SIDEBAR_ID)) return;

  const sidebar = document.createElement("div");
  sidebar.id = SIDEBAR_ID;

  try {
    const sidebarUrl = chrome.runtime.getURL("content/sidebar.html");
    const response = await fetch(sidebarUrl);
    if (!response.ok) throw new Error("Failed to load sidebar.html");
    const html = await response.text();
    sidebar.innerHTML = html;
  } catch (err) {
    console.error("Chat History Tracker: failed to inject sidebar", err);
    return;
  }

  document.documentElement.appendChild(sidebar);

  const handle = sidebar.querySelector(".cht-sidebar-handle");
  const body = sidebar.querySelector(".cht-sidebar-body");

  if (handle && body) {
    // Open when cursor is on the red handle
    handle.addEventListener("mouseenter", () => {
      sidebar.classList.add("cht-open");
    });

    // Keep open while hovering the main panel
    body.addEventListener("mouseenter", () => {
      sidebar.classList.add("cht-open");
    });

    // Close when leaving the entire sidebar region
    sidebar.addEventListener("mouseleave", () => {
      sidebar.classList.remove("cht-open");
    });
  }

  const list = sidebar.querySelector(".cht-sidebar-list");
  if (list && !list.firstChild) {
    const empty = document.createElement("div");
    empty.className = "cht-empty-state";
    empty.textContent = "Your questions in this conversation will appear here.";
    list.appendChild(empty);
  }
}

function clearSidebar() {
  questionMap.clear();
  nextQuestionId = 1;
  const sidebar = document.getElementById(SIDEBAR_ID);
  if (!sidebar) return;
  const list = sidebar.querySelector(".cht-sidebar-list");
  if (!list) return;
  list.innerHTML = "";
  const empty = document.createElement("div");
  empty.className = "cht-empty-state";
  empty.textContent = "Your questions in this conversation will appear here.";
  list.appendChild(empty);
  updateHandleHeight();
}

function textFromNode(node) {
  if (!node) return "";
  return node.textContent ? node.textContent.trim().replace(/\s+/g, " ") : "";
}

function summarizeQuestionText(fullText) {
  if (!fullText) return "";
  const maxLen = 120;
  if (fullText.length <= maxLen) return fullText;
  return fullText.slice(0, maxLen).trimEnd() + "…";
}

function addQuestionEntry(questionEl, text) {
  if (!questionEl) return;
  const id = String(nextQuestionId++);
  questionEl.setAttribute(QUESTION_ATTR, id);
  questionMap.set(id, questionEl);

  const sidebar = document.getElementById(SIDEBAR_ID);
  if (!sidebar) return;
  const list = sidebar.querySelector(".cht-sidebar-list");
  if (!list) return;

  // Clear empty state
  const empty = list.querySelector(".cht-empty-state");
  if (empty) {
    empty.remove();
  }

  const item = document.createElement("div");
  item.className = SIDEBAR_ITEM_CLASS;
  item.dataset.questionId = id;
  item.textContent = summarizeQuestionText(text);

  item.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const target = questionMap.get(id);
    if (!target) return;
    // Prefer scrollIntoView so we respect app-specific scroll containers
    try {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
    } catch (_) {
      const rect = target.getBoundingClientRect();
      const absoluteY = window.scrollY + rect.top - 80;
      window.scrollTo({
        top: absoluteY,
        behavior: "smooth"
      });
    }

    // highlight in sidebar
    list.querySelectorAll(`.${SIDEBAR_ITEM_CLASS}.cht-active`).forEach((el) => {
      el.classList.remove("cht-active");
    });
    item.classList.add("cht-active");
  });

  list.appendChild(item);
  updateHandleHeight();
}

function updateHandleHeight() {
  const sidebar = document.getElementById(SIDEBAR_ID);
  if (!sidebar) return;
  const list = sidebar.querySelector(".cht-sidebar-list");
  const handle = sidebar.querySelector(".cht-sidebar-handle");
  if (!list || !handle) return;

  const count = list.querySelectorAll(`.${SIDEBAR_ITEM_CLASS}`).length;
  // Min height 60px, grow by 20px per item, max height 60% of viewport
  const newHeight = Math.min(Math.max(60, count * 24), window.innerHeight * 0.6);
  handle.style.height = `${newHeight}px`;
}

