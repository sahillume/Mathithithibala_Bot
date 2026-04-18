/**
 * Ultra Pro AI Command - Sahil AI Assistant (CHATGPT MEMORY UPGRADE)
 */

const APIs = require('../../utils/api');
const { sahilProfile, isSahilQuestion, getSahilResponse } = require('../../sahilProfile');
const { saveMemory, formatMemory } = require('../../utils/memory');

function splitMessage(text, maxLength = 3500) {
  const parts = [];
  let current = "";

  const lines = text.split("\n");

  for (let line of lines) {
    if ((current + "\n" + line).length > maxLength) {
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
  name: 'ai',
  aliases: ['gpt', 'chatgpt', 'ask'],
  category: 'ai',
  description: 'Ultra Professional AI Assistant (Memory Enabled)',
  usage: '.ai <question>',

  async execute(sock, msg, args, extra) {
    try {

      const userId = msg.key.remoteJid;
      const fullText = args.join(' ');

      // 🧠 MENU
      if (!fullText) {
        return extra.reply(`╭━━『 🤖 *Mathithibala AI* 』━━╮

👋 I am *Professor Sahil's AI Assistant*

💡 Ask anything:
• Essays
• Explanations
• Advice
• Learning help

📌 Example:
.ai explain photosynthesis

╰━━━━━━━━━━━━━━━━━`);
      }

      // 👑 SAHIL SYSTEM (HIGHEST PRIORITY)
      if (isSahilQuestion(fullText)) {
        const sahilReply = getSahilResponse(fullText);

        return extra.reply(`╭━━『 👑 *Sahil System* 』━━╮

${sahilReply}

╰━━━━━━━━━━━━━━━━━`);
      }

      await extra.reply('🤖 Mathithibala AI is thinking...\n⏳ Please wait ~30 seconds');

      // 🧠 SAVE USER MESSAGE
      saveMemory(userId, "user", fullText);

      // 🧠 GET MEMORY CONTEXT
      const memory = formatMemory(userId);

      // 🔥 STRONG CHATGPT STYLE PROMPT
      const prompt = `
You are Mathithibala AI created by Professor Sahil.

CORE RULES:
- Always give COMPLETE answers
- Never cut explanations
- Be clear, structured, and helpful
- Use previous conversation if relevant

IMPORTANT:
- If user continues topic, use memory
- If new topic, ignore old memory

CONVERSATION MEMORY:
${memory}

CURRENT QUESTION:
${fullText}
`;

      // 🔥 API CALL
      const response = await APIs.chatAI(prompt);

      let answer =
        response?.response ||
        response?.msg ||
        response?.data?.msg ||
        response?.data?.response ||
        response?.data?.text ||
        response?.result ||
        response?.answer ||
        response;

      if (typeof answer === "object") {
        answer = JSON.stringify(answer, null, 2);
      }

      answer = String(answer || "").trim();

      if (!answer) {
        return extra.reply('❌ AI failed to generate response.');
      }

      // 🧹 CLEAN OUTPUT
      answer = answer
        .replace(/\\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      // 🧠 SAVE AI RESPONSE (IMPORTANT FIX)
      saveMemory(userId, "ai", answer);

      const finalMessage = `╭━━『 🤖 *Mathithibala AI* 』━━╮
👑 Powered by Professor Sahil
🧠 Question: ${fullText}
━━━━━━━━━━━━━━━━━━

📖 Answer:
${answer}

━━━━━━━━━━━━━━━━━━
💡 System: Memory Enabled AI`;

      // 🚀 SAFE SEND (NO CUTTING FIX)
      const parts = splitMessage(finalMessage);

      for (let i = 0; i < parts.length; i++) {
        await sock.sendMessage(extra.from, {
          text: parts[i]
        }, { quoted: msg });

        await new Promise(r => setTimeout(r, 700));
      }

    } catch (error) {
      console.log(error);
      return extra.reply('❌ AI Error. Please try again later.');
    }
  }
};
