/**
 * Magic Studio AI - Mathithibala AI
 * Professional AI Image Studio Command
 */

const axios = require('axios');
const config = require('../../config');

module.exports = {
  name: 'magicstudio',
  aliases: ['magic', 'studio', 'genimg2'],
  category: 'ai',
  description: 'Advanced AI Image Generator (Magic Studio)',
  usage: '.magicstudio <prompt>',

  async execute(sock, msg, args, extra) {
    try {

      const prompt = args.join(' ');

      // 📌 No prompt menu
      if (!prompt) {
        return extra.reply(`╭━━『 🎨 *Magic Studio AI* 』━━╮

👑 *Mathithibala AI Creative Engine*

📌 Usage:
.magicstudio a dragon made of lightning
.magicstudio cyberpunk city at night
.magicstudio futuristic soldier portrait

✨ High quality AI image generation

╰━━━━━━━━━━━━━━━━━`);
      }

      // 🔄 Loading state
      await sock.sendMessage(extra.from, {
        text: `🎨 *Magic Studio AI*\n⏳ Generating your image...\n\n🧠 Prompt: ${prompt}\n👑 Powered by Professor Sahil`
      }, { quoted: msg });

      // 🔥 IMAGE GENERATION API (replace with your real API)
      const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&model=flux`;

      const response = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
        timeout: 120000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      const imageBuffer = Buffer.from(response.data);

      if (!imageBuffer || imageBuffer.length < 1000) {
        return extra.reply('❌ Failed to generate image. Try another prompt.');
      }

      // 🖼️ Caption branding
      const caption = `╭━━『 🎨 *MAGIC STUDIO AI* 』━━╮

🧠 Prompt:
${prompt}

👑 Creator: Professor Sahil
🤖 System: Mathithibala AI

✨ Status: Image Generated Successfully

╰━━━━━━━━━━━━━━━━━`;

      // 📤 Send image
      await sock.sendMessage(extra.from, {
        image: imageBuffer,
        caption: caption
      }, { quoted: msg });

    } catch (error) {
      console.log('[MagicStudio Error]', error);

      return extra.reply(`❌ Magic Studio failed.

Possible reasons:
- API down
- Invalid prompt
- Network issue

Please try again later.`);
    }
  }
};
