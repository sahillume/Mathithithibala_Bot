/**
 * 🤖 Sahil Pro Vision AI Command
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 * System: Mathithibala_Bot Pro Vision Module
 */

const APIs = require('../../utils/api');
const { saveMemory, formatMemory } = require('../../utils/memory');

module.exports = {
  name: 'aivision',
  aliases: ['visionai', 'ai-view', 'sahilai'],
  category: 'sahilPro',
  description: 'Advanced AI Vision & Intelligent Response System (Sahil Pro)',
  usage: '.aivision <question>',

  async execute(sock, msg, args, extra) {
    try {
      const userId = msg.key.remoteJid;
      const text = args.join(' ').trim();

      // ===============================
      // 📌 EMPTY INPUT HANDLER
      // ===============================
      if (!text) {
        return extra.reply(
`╭━━『 🤖 Sahil Pro Vision AI 』━━╮

👑 Advanced AI System Active

💡 Usage:
.aivision explain black holes
.aivision solve this problem

⚡ Powered by Sahil Pro Engine

╰━━━━━━━━━━━━━━━━━━━━`
        );
      }

      // ===============================
      // 🧠 SAVE USER INPUT (MEMORY)
      // ===============================
      saveMemory(userId, "user", text);

      const memory = formatMemory(userId);

      // ===============================
      // 🧠 PRO AI PROMPT ENGINE
      // ===============================
      const prompt = `
You are Sahil Pro Vision AI.

RULES:
- Be highly intelligent and structured
- Give complete explanations
- Use memory if relevant
- Stay professional and clear

CONVERSATION MEMORY:
${memory}

USER QUESTION:
${text}
`;

      await extra.reply("🤖 Sahil Vision AI is analyzing...\n⏳ Please wait");

      // ===============================
      // 🔥 API CALL
      // ===============================
      const response = await APIs.chatAI(prompt);

      let answer =
        response?.response ||
        response?.msg ||
        response?.data?.text ||
        response?.result ||
        response?.answer ||
        response;

      if (typeof answer === 'object') {
        answer = JSON.stringify(answer, null, 2);
      }

      answer = String(answer || "").trim();

      if (!answer) {
        return extra.reply("❌ AI failed to generate response.");
      }

      // ===============================
      // 🧹 CLEAN OUTPUT
      // ===============================
      answer = answer
        .replace(/\\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      // ===============================
      // 🧠 SAVE AI RESPONSE MEMORY
      // ===============================
      saveMemory(userId, "ai", answer);

      // ===============================
      // 📤 FINAL OUTPUT
      // ===============================
      const finalMsg =
`╭━━『 🤖 Sahil Pro Vision AI 』━━╮
👑 Professor Sahil System
━━━━━━━━━━━━━━━━━━

📖 Answer:
${answer}

━━━━━━━━━━━━━━━━━━
⚡ System: Vision AI + Memory Active`;

      return extra.reply(finalMsg);

    } catch (error) {
      console.error("Sahil AI Vision Error:", error);
      return extra.reply("❌ Vision AI Error. Please try again later.");
    }
  }
};
