/**
 * Mode Command
 * Toggle bot between private and public mode (FIXED + SAFE)
 */

const config = require('../../config');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'mode',
  aliases: ['botmode', 'privatemode', 'publicmode'],
  category: 'owner',
  description: 'Toggle bot between private and public mode',
  usage: '.mode <private/public>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;

      const currentMode = config.selfMode ? 'PRIVATE' : 'PUBLIC';

      if (!args[0]) {
        return extra.reply(
          `🤖 *BOT MODE*\n\n` +
          `Current Mode: *${currentMode}*\n\n` +
          `📌 PRIVATE → Only owner can use bot\n` +
          `📌 PUBLIC → Everyone can use bot\n\n` +
          `Usage:\n` +
          `.mode private\n` +
          `.mode public`
        );
      }

      const mode = args[0].toLowerCase();

      if (mode === 'private' || mode === 'priv') {
        if (config.selfMode === true) {
          return extra.reply('🔒 Bot is already in PRIVATE mode.');
        }

        setMode(true);
        config.selfMode = true;

        return extra.reply('🔒 Bot switched to *PRIVATE MODE*');
      }

      if (mode === 'public' || mode === 'pub') {
        if (config.selfMode === false) {
          return extra.reply('🌐 Bot is already in PUBLIC mode.');
        }

        setMode(false);
        config.selfMode = false;

        return extra.reply('🌐 Bot switched to *PUBLIC MODE*');
      }

      return extra.reply('❌ Invalid option!\nUse: .mode private / public');

    } catch (error) {
      console.error('Mode command error:', error);
      return extra.reply('❌ Failed to change mode.');
    }
  }
};

/**
 * Save mode properly in config.js
 */
function setMode(value) {
  try {
    const configPath = path.join(__dirname, '../../config.js');
    let data = fs.readFileSync(configPath, 'utf8');

    if (data.includes('selfMode')) {
      data = data.replace(
        /selfMode\s*:\s*(true|false)/,
        `selfMode: ${value}`
      );
    } else {
      data = data.replace(
        /(module\.exports\s*=\s*{)/,
        `$1\n  selfMode: ${value},`
      );
    }

    fs.writeFileSync(configPath, data, 'utf8');

  } catch (err) {
    console.error('Config update error:', err);
  }
}
