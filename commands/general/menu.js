/**
 * Menu Command - FULL PRO VERSION (CHANNEL ADDED)
 * Mathithibala_Bot Pro | Professor Sahil System
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');

module.exports = {
  name: 'menu',
  aliases: ['help', 'commands'],
  category: 'general',
  description: 'Show all available commands',
  usage: '.menu',

  async execute(sock, msg, args, extra) {
    try {
      const commands = loadCommands();
      const categories = {};

      // ===============================
      // GROUP COMMANDS BY CATEGORY
      // ===============================
      commands.forEach((cmd, name) => {
        if (cmd.name === name) {
          const cat = cmd.category || 'other';
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(cmd);
        }
      });

      const ownerName = config.ownerName || 'Professor Sahil';
      const channel = config.newsletterJid || 'Not Set';

      let menuText = `╭━━『 *${config.botName}* 』━━╮\n\n`;
      menuText += `👋 Hello @${extra.sender.split('@')[0]}\n\n`;
      menuText += `⚡ Prefix: ${config.prefix}\n`;
      menuText += `📦 Commands: ${commands.size}\n`;
      menuText += `👑 Owner: ${ownerName}\n\n`;

      // ===============================
      // 📢 CHANNEL SECTION (NEW 🔥)
      // ===============================
      menuText += `┏━━━━━━━━━━━━━━━━━\n`;
      menuText += `┃ 📢 OFFICIAL CHANNEL\n`;
      menuText += `┗━━━━━━━━━━━━━━━━━\n`;
      menuText += `│ ➜ ${channel}\n\n`;

      // ===============================
      // FUNCTION TO PRINT CATEGORY
      // ===============================
      const printCategory = (title, emoji, cmds) => {
        if (!cmds || !cmds.length) return '';

        let text = `┏━━━━━━━━━━━━━━━━━\n`;
        text += `┃ ${emoji} ${title}\n`;
        text += `┗━━━━━━━━━━━━━━━━━\n`;

        cmds.forEach(cmd => {
          text += `│ ➜ ${config.prefix}${cmd.name}\n`;
        });

        return text + `\n`;
      };

      // ===============================
      // NORMAL USER COMMANDS
      // ===============================
      menuText += printCategory("GENERAL", "🧭", categories.general);
      menuText += printCategory("AI", "🤖", categories.ai);
      menuText += printCategory("FUN", "🎭", categories.fun);
      menuText += printCategory("MEDIA", "🎞️", categories.media);
      menuText += printCategory("UTILITY", "🔧", categories.utility);
      menuText += printCategory("ANIME", "👾", categories.anime);

      // ===============================
      // 👑 SAHIL PRO SYSTEM
      // ===============================
      menuText += printCategory(
        "SAHIL PRO SYSTEM",
        "👑",
        categories.sahilpro || categories['sahilPro.lume']
      );

      // ===============================
      // 🛡️ ADMIN COMMANDS (FIXED)
      // ===============================
      menuText += printCategory("ADMIN COMMANDS", "🛡️", categories.admin);

      // ===============================
      // 👑 OWNER COMMANDS
      // ===============================
      menuText += printCategory("OWNER COMMANDS", "👑", categories.owner);

      // ===============================
      // 🖋️ TEXTMAKER
      // ===============================
      menuText += printCategory("TEXTMAKER", "🖋️", categories.textmaker);

      menuText += `╰━━━━━━━━━━━━━━━━━\n\n`;
      menuText += `💡 Use ${config.prefix}help <command>\n`;
      menuText += `🚀 Mathithibala Pro System Active`;

      // ===============================
      // SEND MENU
      // ===============================
      await sock.sendMessage(extra.from, {
        text: menuText,
        mentions: [extra.sender]
      }, { quoted: msg });

    } catch (error) {
      console.log("MENU ERROR:", error);
      extra.reply("❌ Menu error.");
    }
  }
};
