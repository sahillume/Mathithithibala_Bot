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
          const command = require(fullPath);
          if (command?.name) {
            commands.set(command.name, command);
          }
          if (command?.aliases) {
            for (const alias of command.aliases) {
              commands.set(alias, command);
            }
          }
        } catch (e) {
          console.log(`❌ Failed loading command: ${file}`);
        }
      }
    }
  }

  readDir(commandsPath);
  return commands;
}

module.exports = { loadCommands };
