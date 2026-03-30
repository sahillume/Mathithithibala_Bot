/**
 * Sahil Profile - Central Knowledge System
 * Gives AI controlled knowledge about Sahil (with privacy protection)
 */

// ⚠️ Safe require (prevents crash if API file missing)
let APIs;
try {
  APIs = require('./utils/api');
} catch (e) {
  APIs = null;
}

const sahilProfile = {
  name: "Sahil",
  title: "Professor Sahil",
  gender: "Male",
  dob: "2008/08/06",
  role: "Creator of Mathithibala AI",
  status: "Matric Student",
  location: "Confidential",
  contacts: ["+27835515085", "+27724469823"]
};

/**
 * Detect if message is about Sahil
 */
function isSahilQuestion(text = "") {
  const keywords = [
    "sahil",
    "who created you",
    "your creator",
    "your owner",
    "who is your leader",
    "who made you",

    // greetings
    "how are you sahil",
    "hello sahil",
    "hi sahil",
    "hey sahil",
    "good morning sahil",
    "good evening sahil",

    // info
    "who is sahil",
    "where is sahil",
    "age sahil",
    "how old sahil",
    "contact sahil",
    "number sahil"
  ];

  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

/**
 * Generate response
 */
function getSahilResponse(text = "") {
  const lower = text.toLowerCase();

  // 👋 Greeting
  if (
    lower.includes("hello sahil") ||
    lower.includes("hi sahil") ||
    lower.includes("hey sahil") ||
    lower.includes("good morning sahil") ||
    lower.includes("good evening sahil")
  ) {
    return `👋 Hello!

My leader *Professor Sahil* sends his regards 👑

🤖 I am his AI assistant running on the Mathithibala Hacker Bot system.`;
  }

  // 💙 How are you
  if (lower.includes("how are you sahil")) {
    return `👑 My leader *Professor Sahil* is doing well but currently focused on improving the Mathithibala AI system.

🤖 He is busy developing and cannot respond personally right now.`;
  }

  // 👑 Who is Sahil
  if (lower.includes("who is sahil")) {
    return `👑 *${sahilProfile.title}*

Sahil is the creator of *Mathithibala AI*.

🎓 Status: ${sahilProfile.status}  
🧠 Role: ${sahilProfile.role}  
🚀 Known as: ${sahilProfile.title}

He is a highly intelligent developer building advanced AI systems.`;
  }

  // 📍 Location (PRIVATE 🔒)
  if (lower.includes("where is sahil")) {
    return `🔒 That information is private.

🤖 You may kindly ask my leader *Sahil* himself. I truly respect him and cannot share that.`;
  }

  // 🎂 Age
  if (lower.includes("how old") || lower.includes("age")) {
    const birthYear = 2008;
    const age = new Date().getFullYear() - birthYear;

    return `🎂 Sahil is approximately *${age} years old* (Born: ${sahilProfile.dob}).`;
  }

  // 📞 Contact
  if (
    lower.includes("contact") ||
    lower.includes("number") ||
    lower.includes("phone")
  ) {
    return `📞 You can contact *Professor Sahil* here:

${sahilProfile.contacts.join(' / ')}`;
  }

  // 🤖 Creator
  if (
    lower.includes("who created you") ||
    lower.includes("your creator") ||
    lower.includes("owner") ||
    lower.includes("who made you")
  ) {
    return `🤖 I was created by *${sahilProfile.title}*.

He is the mastermind behind the Mathithibala Hacker Bot system.`;
  }

  // 🔒 UNKNOWN PERSONAL QUESTION (IMPORTANT 🔥)
  if (lower.includes("sahil")) {
    return `🔒 That information is private.

🤖 You can ask my leader *Sahil* himself. I truly respect him and cannot share that kind of information.`;
  }

  // Default fallback
  return null;
}

module.exports = {
  sahilProfile,
  isSahilQuestion,
  getSahilResponse
};
