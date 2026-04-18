/**
 * Auto-React Command - Advanced System (PRO)
 */

const { load, save } = require('../../utils/autoReact');

module.exports = {
  name: 'autoreact',
  aliases: ['ar'],
  category: 'owner',
  description: 'Configure automatic message reactions',
  usage: '.autoreact on/off/set bot/set all',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const db = load();

      const input = args.join(' ').toLowerCase().trim();

      if (!input) {
        return extra.reply(
`🤖 *AUTO REACT SYSTEM*

📌 on - Enable auto react
📌 off - Disable auto react
📌 set bot - React only to bot commands
📌 set all - React to all messages

Current:
Status: ${db.enabled ? 'ON 🟢' : 'OFF 🔴'}
Mode: ${db.mode || 'bot'}`
        );
      }

      // ON
      if (input === 'on') {
        db.enabled = true;
        save(db);
        return extra.reply('🟢 Auto-react ENABLED');
      }

      // OFF
      if (input === 'off') {
        db.enabled = false;
        save(db);
        return extra.reply('🔴 Auto-react DISABLED');
      }

      // BOT MODE
      if (input === 'set bot') {
        db.mode = 'bot';
        save(db);
        return extra.reply('🤖 Auto-react set to BOT commands only');
      }

      // ALL MODE
      if (input === 'set all') {
        db.mode = 'all';
        save(db);
        return extra.reply('🌟 Auto-react set to ALL messages');
      }

      return extra.reply('❌ Invalid option. Use: on / off / set bot / set all');

    } catch (error) {
      console.error('[AutoReact]', error);
      return extra.reply('❌ Failed to configure auto-react.');
    }
  }
};
