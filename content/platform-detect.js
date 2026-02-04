// Platform detection and question node discovery

function detectPlatform() {
  const host = location.host;
  if (host.includes("chat.openai.com") || host.includes("chatgpt.com")) {
    return "chatgpt";
  }
  if (host.includes("claude.ai")) {
    return "claude";
  }
  if (host.includes("gemini.google.com")) {
    return "gemini";
  }
  return null;
}

// Site-specific question detection
function findQuestionsChatGPT(root) {
  // ChatGPT user messages usually have data-message-author-role="user"
  const selector = '[data-message-author-role="user"], .text-base.md\\:px-4';
  const nodes = root.querySelectorAll(selector);
  const questions = [];
  nodes.forEach((node) => {
    // Avoid duplicates
    if (node.hasAttribute(QUESTION_ATTR)) return;
    const txt = textFromNode(node);
    if (!txt) return;
    // Heuristic: treat all user messages as "questions" for navigation purposes
    questions.push({ el: node, text: txt });
  });
  return questions;
}

function findQuestionsClaude(root) {
  // Claude user messages: data-testid or [data-role="user"] patterns
  const selector = '[data-testid="user-message"], [data-role="user"], .user-message';
  const nodes = root.querySelectorAll(selector);
  const questions = [];
  nodes.forEach((node) => {
    if (node.hasAttribute(QUESTION_ATTR)) return;
    const txt = textFromNode(node);
    if (!txt) return;
    questions.push({ el: node, text: txt });
  });
  return questions;
}

function findQuestionsGemini(root) {
  // Gemini user messages are often in elements with aria-label "You" or role="button" in threads.
  const selector = '[data-md="user-message"], [data-creator="user"], [aria-label="You"], .user-bubble';
  const nodes = root.querySelectorAll(selector);
  const questions = [];
  nodes.forEach((node) => {
    if (node.hasAttribute(QUESTION_ATTR)) return;
    const txt = textFromNode(node);
    if (!txt) return;
    questions.push({ el: node, text: txt });
  });
  return questions;
}

function scanForQuestions() {
  const platform = detectPlatform();
  if (!platform) return;
  const root = document.body;
  let found = [];
  if (platform === "chatgpt") {
    found = findQuestionsChatGPT(root);
  } else if (platform === "claude") {
    found = findQuestionsClaude(root);
  } else if (platform === "gemini") {
    found = findQuestionsGemini(root);
  }
  found.forEach(({ el, text }) => addQuestionEntry(el, text));
}

