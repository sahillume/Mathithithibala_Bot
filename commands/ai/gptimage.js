/**
 * GPT Image Generator - Mathithibala AI
 * Professional Image AI Command
 */

const axios = require('axios');
const config = require('../../config');

module.exports = {
  name: 'gptimage',
  aliases: ['imgai', 'aiimage', 'draw', 'imagine'],
  category: 'ai',
  description: 'Generate AI images from text prompts',
  usage: '.gptimage <prompt>',

  async execute(sock, msg, args, extra) {
    try {

      const prompt = args.join(' ');

      if (!prompt) {
        return extra.reply(`╭━━『 🎨 *AI Image Generator* 』━━╮

🤖 *Mathithibala AI Visual Engine*

📌 Usage:
.gptimage a futuristic city at night
.gptimage lion made of fire
.gptimage anime girl in cyberpunk world

╰━━━━━━━━━━━━━━━━━`);
      }

      // 🔄 Loading message
      await sock.sendMessage(extra.from, {
        text: `🎨 *Generating Image...*\n⏳ Sahil's AI is creating your image...\n\n🧠 Prompt: ${prompt}`
      }, { quoted: msg });

      // 🔥 IMAGE API (replace with your working API)
      const apiUrl = `https://api.lolhuman.xyz/api/text2img?apikey=YOUR_API_KEY&text=${encodeURIComponent(prompt)}`;

      const response = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
        timeout: 120000
      });

      const imageBuffer = Buffer.from(response.data);

      if (!imageBuffer || imageBuffer.length === 0) {
        return extra.reply('❌ Failed to generate image.');
      }

      const caption = `╭━━『 🎨 *AI IMAGE GENERATED* 』━━╮

🧠 *Prompt:* ${prompt}

👑 *Powered by:* Mathithibala AI
⚡ *Creator:* Professor Sahil

╰━━━━━━━━━━━━━━━━━`;

      await sock.sendMessage(extra.from, {
        image: imageBuffer,
        caption: caption
      }, { quoted: msg });

    } catch (error) {
      console.log(error);
      return extra.reply('❌ Image generation failed. Try again later.');
    }
  }
};
