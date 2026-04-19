/**
 * Ultra Pro AI Command - Sahil AI Assistant (Memory + Stable Output)
 */

const APIs = require('../../utils/api');
const { sahilProfile, isSahilQuestion, getSahilResponse } = require('../../sahilProfile');
const { saveMemory, formatMemory } = require('../../utils/memory');

module.exports = {
  name: 'ai',
  aliases: ['gpt', 'chatgpt', 'ask'],
  category: 'ai',
  description: 'Ultra Professional AI Assistant (Memory Enabled)',

  async execute(sock, msg, args, extra) {
    try {

      const userId = msg.key.remoteJid;
      const text = args.join(' ').trim();

      // 📌 MENU
      if (!text) {
        return extra.reply(`╭━━『 🤖 Mathithibala AI 』━━╮

👋 Powered by Professor Sahil

💡 Ask anything:
• Essays
• Explanations
• Coding help
• General knowledge

📌 Example:
.ai explain photosynthesis

╰━━━━━━━━━━━━━━━━━`);
      }

      // 👑 SAHIL SYSTEM PRIORITY
      if (isSahilQuestion(text)) {
        const res = getSahilResponse(text);
        return extra.reply(`╭━━『 👑 Sahil System 』━━╮

${res}

╰━━━━━━━━━━━━━━━━━`);
      }

      // ⚡ QUICK STATUS
      await extra.reply('🤖 Thinking...\n⏳ Sahil AI is processing your request...');

      // 🧠 MEMORY
      saveMemory(userId, "user", text);
      const memory = formatMemory(userId);

      // 🧠 CLEAN PROMPT (CHATGPT STYLE)
      const prompt = `
You are "Mathithibala AI", created by Professor Sahil.

RULES:
- Give COMPLETE answers
- Be clear, structured, and helpful
- Do NOT cut answers
- Use memory only if relevant

MEMORY:
${memory}

QUESTION:
${text}
`;

      // 🔥 API CALL
      const response = await APIs.chatAI(prompt);

      let answer =
        response?.response ||
        response?.result ||
        response?.answer ||
        response?.data?.text ||
        response?.data?.response ||
        response?.msg ||
        response;

      if (typeof answer === "object") {
        answer = JSON.stringify(answer, null, 2);
      }

      answer = String(answer || '').trim();

      if (!answer) {
        return extra.reply('❌ AI failed to respond. Try again.');
      }

      // 🧠 SAVE AI MEMORY
      saveMemory(userId, "ai", answer);

      // 📩 FINAL OUTPUT
      const finalMessage = `╭━━『 🤖 Mathithibala AI 』━━╮
👑 Powered by Professor Sahil
━━━━━━━━━━━━━━━━━━

🧠 Question:
${text}

📖 Answer:
${answer}

━━━━━━━━━━━━━━━━━━
💡 Memory Enabled AI`;

      return sock.sendMessage(extra.from, {
        text: finalMessage
      }, { quoted: msg });

    } catch (err) {
      console.log(err);
      return extra.reply('❌ AI Error occurred. Try again later.');
    }
  }
};
