/**
 * 🤖 Sahil Pro Smart AI System
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 * System: Mathithibala_Bot AI Core Upgrade
 */

const APIs = require('../../utils/api');
const { saveMemory, formatMemory } = require('../../utils/memory');

function splitMessage(text, max = 3500) {
  const parts = [];
  let current = "";

  for (let line of text.split("\n")) {
    if ((current + "\n" + line).length > max) {
      parts.push(current);
      current = line;
    } else {
      current += (current ? "\n" : "") + line;
    }
  }

  if (current) parts.push(current);
  return parts;
}

module.exports = {
  name: 'smartai',
  aliases: ['ai2', 'chat', 'assistant'],
  category: 'sahilPro',
  description: 'Advanced Smart AI with memory system',
  usage: '.smartai <question>',

  async execute(sock, msg, args, extra) {
    try {

      const from = msg.key.remoteJid;
      const userId = msg.key.participant || msg.key.remoteJid;
      const question = args.join(' ');

      // ===============================
      // 📌 HELP MENU
      // ===============================
      if (!question) {
        return extra.reply(
`╭━━『 🤖 SMART AI SYSTEM 』━━╮

💡 Ask anything:
.smartai explain gravity
.smartai write essay on water cycle
.smartai help me study math

🧠 Features:
✔ Memory enabled
✔ Long answers
✔ Structured responses

╰━━━━━━━━━━━━━━`
        );
      }

      // ===============================
      // 🧠 SAVE USER INPUT
      // ===============================
      saveMemory(userId, "user", question);

      const memory = formatMemory(userId);

      // ===============================
      // 🧠 AI PROMPT ENGINE
      // ===============================
      const prompt = `
You are Smart AI inside Mathithibala Bot created by Professor Sahil.

RULES:
- Give clear structured answers
- Be educational and helpful
- Use memory if relevant
- Avoid short answers unless requested

CONVERSATION MEMORY:
${memory}

USER QUESTION:
${question}
`;

      // ===============================
      // 🤖 API CALL
      // ===============================
      const res = await APIs.chatAI(prompt);

      let answer =
        res?.response ||
        res?.data?.response ||
        res?.data?.text ||
        res?.result ||
        res?.answer ||
        res;

      if (typeof answer === "object") {
        answer = JSON.stringify(answer, null, 2);
      }

      answer = String(answer || "").trim();

      if (!answer) {
        return extra.reply("❌ Smart AI failed to respond.");
      }

      // ===============================
      // 🧠 SAVE AI RESPONSE MEMORY
      // ===============================
      saveMemory(userId, "ai", answer);

      const finalText = `
╭━━『 🤖 SMART AI 』━━╮
👑 Sahil Pro Engine
━━━━━━━━━━━━━━

📌 Question:
${question}

━━━━━━━━━━━━━━
📖 Answer:
${answer}

━━━━━━━━━━━━━━
🧠 Memory Active System
`;

      // ===============================
      // 📤 SAFE SEND (CHUNKED)
      // ===============================
      const parts = splitMessage(finalText);

      for (let i = 0; i < parts.length; i++) {
        await sock.sendMessage(from, {
          text: parts[i]
        }, { quoted: msg });

        await new Promise(r => setTimeout(r, 500));
      }

    } catch (err) {
      console.log("SmartAI Error:", err.message);
      return extra.reply("❌ Smart AI system error.");
    }
  }
};
