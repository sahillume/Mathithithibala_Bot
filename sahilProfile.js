/**
 * Sahil Profile - Central Knowledge System (PRO VERSION)
 * Secure + structured + AI identity handler
 */

// Safe require
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
  location: "Private"
  // ⚠️ Do NOT expose contacts directly in responses
};

/**
 * Detect Sahil-related questions
 */
function isSahilQuestion(text = "") {
  const lower = text.toLowerCase();

  const keywords = [
    "sahil",
    "professor sahil",
    "your creator",
    "who created you",
    "your owner",
    "who made you",
    "who is your leader",
    "tell me about sahil"
  ];

  return keywords.some(k => lower.includes(k));
}

/**
 * Main response engine
 */
function getSahilResponse(text = "") {
  const lower = text.toLowerCase();

  // 🟢 BOT NAME QUESTION
  if (
    lower.includes("your name") ||
    lower.includes("who are you") ||
    lower === "name"
  ) {
    return `🤖 I am *Mathithibala AI Bot*.

👑 I was created under the guidance of *Professor Sahil*.`;
  }

  // 👋 GREETING
  if (
    lower.includes("hello sahil") ||
    lower.includes("hi sahil") ||
    lower.includes("hey sahil")
  ) {
    return `👋 Hello!

I respectfully represent *Professor Sahil* 👑

🤖 I am his AI assistant under the Mathithibala system.`;
  }

  // 👑 WHO CREATED YOU
  if (
    lower.includes("who created you") ||
    lower.includes("your creator") ||
    lower.includes("who made you") ||
    lower.includes("owner")
  ) {
    return `🤖 I was created by *Professor Sahil*.

He is the developer behind the Mathithibala AI system 👑`;
  }

  // 👑 WHO IS SAHIL
  if (lower.includes("who is sahil")) {
    return `👑 *${sahilProfile.title}*

🧠 Role: ${sahilProfile.role}  
🎓 Status: ${sahilProfile.status}  
🚀 Known as: Mathithibala AI Creator  

He is the developer and mind behind this system.`;
  }

  // 🎂 AGE
  if (lower.includes("how old") || lower.includes("age sahil")) {
    const age = new Date().getFullYear() - 2008;
    return `🎂 *Professor Sahil* is approximately ${age} years old (Born ${sahilProfile.dob}).`;
  }

  // 📍 LOCATION (STRICT PRIVACY)
  if (
    lower.includes("where is sahil") ||
    lower.includes("location sahil")
  ) {
    return `🔒 Sorry, I cannot share that information.

I deeply respect my leader *Professor Sahil* and his privacy.

🙏 Please contact him directly if needed.`;
  }

  // 📞 CONTACT (BLOCKED FOR PRIVACY SAFETY)
  if (
    lower.includes("contact sahil") ||
    lower.includes("number sahil") ||
    lower.includes("phone sahil")
  ) {
    return `🔒 Contact details are private.

🙏 Please reach out to *Professor Sahil* directly through official channels.`;
  }

  // ❓ UNKNOWN SAHIL QUESTIONS
  if (lower.includes("sahil")) {
    return `🔒 I may not have permission to answer that.

I deeply respect my leader *Professor Sahil* 👑

🙏 Please ask him directly for accurate information.`;
  }

  // ❌ DEFAULT FALLBACK
  return `🤖 I'm not fully sure about that.

I was created by *Professor Sahil*, and I only share verified system knowledge.

🙏 For more details, please contact him directly.`;
}

module.exports = {
  sahilProfile,
  isSahilQuestion,
  getSahilResponse
};
