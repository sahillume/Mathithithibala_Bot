/**
 * AutoStatus Command (UPGRADED)
 * Enables bot to auto-react to WhatsApp status updates
 * Supports custom emoji reaction
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config');

// simple memory store (you can later move to DB)
let autoStatus = {
  enabled: false,
  emoji: '🔥'
};

// load saved data if exists
const filePath = path.join(__dirname, '../../database/autostatus.json');

function loadData() {
  try {
    if (fs.existsSync(filePath)) {
      autoStatus = JSON.parse(fs.readFileSync(filePath));
    }
  } catch (e) {
    console.log('AutoStatus load error:', e.message);
  }
}

function saveData() {
  try {
    fs.writeFileSync(filePath, JSON.stringify(autoStatus, null, 2));
  } catch (e) {
    console.log('AutoStatus save error:', e.message);
  }
}

loadData();

module.exports = {
  name: 'autostatus',
  aliases: ['statusreact'],
  category: 'owner',
  description: 'Auto react to WhatsApp status updates',
  usage: '.autostatus on/off [emoji]',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;

      const cmd = (args[0] || '').toLowerCase();
      const emoji = args[1];

      // SHOW STATUS
      if (!cmd) {
        return extra.reply(
`🤖 *AUTO STATUS SYSTEM*

📌 Status: ${autoStatus.enabled ? '🟢 ON' : '🔴 OFF'}
😀 Reaction Emoji: ${autoStatus.emoji}

🛠 Usage:
.autostatus on 🔥
.autostatus off
.autostatus on ❤️`
        );
      }

      // ENABLE
      if (cmd === 'on') {
        autoStatus.enabled = true;

        if (emoji) {
          autoStatus.emoji = emoji;
        }

        saveData();

        return extra.reply(
`🟢 AutoStatus ENABLED

😀 Reaction Emoji: ${autoStatus.emoji}
📌 Bot will now react to status updates`
        );
      }

      // DISABLE
      if (cmd === 'off') {
        autoStatus.enabled = false;
        saveData();

        return extra.reply(
`🔴 AutoStatus DISABLED`
        );
      }

      return extra.reply('❌ Use: .autostatus on/off [emoji]');

    } catch (error) {
      console.error('AutoStatus error:', error);
      return extra.reply('❌ Error: ' + error.message);
    }
  },

  // export config so handler can use it
  getAutoStatus: () => autoStatus
};
