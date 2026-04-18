 /**
  * Set Prefix Command - Multi Prefix System
  */

const config = require('../../config');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'setprefix',
  aliases: ['prefix', 'addprefix'],
  category: 'owner',
  description: 'Add or set bot prefixes',
  usage: '.setprefix <prefix> | .setprefix list',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const configPath = path.join(__dirname, '../../config.js');

      if (!args[0]) {
        return extra.reply(
`📌 *PREFIX SYSTEM*

Current prefixes:
${config.prefix.join(' ')}

➕ Add: .setprefix !
❌ Remove: .remprefix !
📋 List: .setprefix list`
        );
      }

      const action = args[0].toLowerCase();

      // LIST PREFIXES
      if (action === 'list') {
        return extra.reply(
`📌 *ACTIVE PREFIXES*

${config.prefix.join(' | ')}`
        );
      }

      const newPrefix = args[0];

      if (newPrefix.length > 3) {
        return extra.reply('❌ Prefix must be 1-3 characters long!');
      }

      // Add prefix if not exists
      if (!config.prefix.includes(newPrefix)) {
        config.prefix.push(newPrefix);
      }

      // Save to file
      let configContent = fs.readFileSync(configPath, 'utf-8');

      configContent = configContent.replace(
        /prefix:\s*\[.*?\]/,
        `prefix: ${JSON.stringify(config.prefix)}`
      );

      fs.writeFileSync(configPath, configContent);

      await extra.reply(
`✅ *PREFIX ADDED*

New prefix added: ${newPrefix}

All prefixes:
${config.prefix.join(' ')}`
      );

    } catch (error) {
      console.error(error);
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
