/**
 * Simple AI Memory System (In-Memory Chat Context)
 * ChatGPT-style short-term memory for WhatsApp bot
 */

const memoryStore = new Map();

/**
 * Save user conversation
 */
function saveMemory(userId, role, message) {
  if (!memoryStore.has(userId)) {
    memoryStore.set(userId, []);
  }

  const history = memoryStore.get(userId);

  history.push({ role, message });

  // keep only last 10 messages (prevents lag)
  if (history.length > 10) {
    history.shift();
  }

  memoryStore.set(userId, history);
}

/**
 * Get user memory
 */
function getMemory(userId) {
  return memoryStore.get(userId) || [];
}

/**
 * Format memory for AI prompt
 */
function formatMemory(userId) {
  const history = getMemory(userId);

  if (!history.length) return "";

  return history
    .map(h => `${h.role.toUpperCase()}: ${h.message}`)
    .join("\n");
}

module.exports = {
  saveMemory,
  getMemory,
  formatMemory
};
