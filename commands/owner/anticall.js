/**
 * Anti-Call Command - Enable or disable anti-call system
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config');

module.exports = {
  name: 'anticall',
  category: 'owner',
  ownerOnly: true,
  description: 'Enable or disable anti-call system',
  usage: '.anticall on/off',

  async execute(sock, msg, args, extra) {
    try {
      const option = (args[0] || '').toLowerCase();

      if (!option) {
        return extra.reply(
`📞 *Anti-Call System*

Usage: .anticall on/off

Current Status: ${config.anticall ? 'ON ✅' : 'OFF ❌'}`
        );
      }

      if (!['on', 'off'].includes(option)) {
        return extra.reply('❌ Usage: .anticall on/off');
      }

      const enabled = option === 'on';

      const configPath = path.join(__dirname, '../../config.js');
      let file = fs.readFileSync(configPath, 'utf8');

      // ===============================
      // AUTO ADD IF NOT EXISTS
      // ===============================
      if (!file.includes('anticall')) {
        file = file.replace(
          /module\.exports\s*=\s*{/,
          `module.exports = {\n  anticall: false,`
        );
      }

      // ===============================
      // UPDATE VALUE SAFELY
      // ===============================
      if (file.match(/anticall:\s*(true|false)/)) {
        file = file.replace(
          /anticall:\s*(true|false)/,
          `anticall: ${enabled}`
        );
      } else {
        file = file.replace(
          /module\.exports\s*=\s*{/,
          `module.exports = {\n  anticall: ${enabled},`
        );
      }

      fs.writeFileSync(configPath, file, 'utf8');

      // Reload config instantly
      delete require.cache[require.resolve('../../config')];

      await extra.reply(
        enabled
          ? '📞 ✅ Anti-call ENABLED\nCalls will now be auto-rejected.'
          : '📞 ❌ Anti-call DISABLED'
      );

    } catch (error) {
      console.error('[anticall] error:', error);
      extra.reply('❌ Error updating anti-call system.');
    }
  }
};
