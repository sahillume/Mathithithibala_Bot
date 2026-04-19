/**
 * Command Loader - Mathithibala_Bot
 */

const fs = require('fs');
const path = require('path');

function loadCommands() {
  const commands = new Map();

  const commandsPath = path.join(__dirname, '../commands');

  function readDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);

      if (fs.lstatSync(fullPath).isDirectory()) {
        readDir(fullPath);
      } else if (file.endsWith('.js')) {
        try {
          const cmd = require(fullPath);

          if (cmd?.name) {
            commands.set(cmd.name, cmd);
          }

          if (cmd?.aliases?.length) {
            cmd.aliases.forEach(a => commands.set(a, cmd));
          }

        } catch (err) {
          console.log(`❌ Failed loading command: ${file}`, err.message);
        }
      }
    }
  }

  readDir(commandsPath);

  return commands;
}

module.exports = { loadCommands };
