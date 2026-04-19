/**
 * List Command - Bot Command Menu
 * Mathithibala_Bot Pro | Professor Sahil System
 */

const { loadCommands } = require('../../utils/commandLoader');

module.exports = {
  name: 'list',
  aliases: ['menu', 'help', 'commands'],
  category: 'general',
  description: 'Shows all available bot commands',
  usage: '.list',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      const commands = loadCommands();

      let menu = `📜 *MATHITHIBALA BOT MENU*\n`;
      menu += `👑 Owner: Professor Sahil\n`;
      menu += `━━━━━━━━━━━━━━━━━━\n\n`;

      const categories = {};

      // Group commands by category
      for (let cmd of commands.values()) {
        const cat = cmd.category || 'misc';

        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd.name);
      }

      // Build menu
      for (let [cat, cmds] of Object.entries(categories)) {
        menu += `📂 *${cat.toUpperCase()}*\n`;
        menu += cmds.map(c => `• ${c}`).join('\n') + '\n\n';
      }

      menu += `━━━━━━━━━━━━━━━━━━\n🤖 Mathithibala_Bot`;

      await sock.sendMessage(chatId, {
        text: menu
      }, { quoted: msg });

    } catch (err) {
      console.log('LIST ERROR:', err);
      extra.reply('❌ Failed to load menu.');
    }
  }
};
