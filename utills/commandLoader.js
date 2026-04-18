const fs = require('fs');
const path = require('path');

function loadCommands() {
  const commands = new Map();
  const basePath = path.join(__dirname, '../commands');

  function readDir(dir) {
    const files = fs.readdirSync(dir);

    for (let file of files) {
      const fullPath = path.join(dir, file);

      if (fs.statSync(fullPath).isDirectory()) {
        readDir(fullPath); // read subfolders
      } else if (file.endsWith('.js')) {
        try {
          const cmd = require(fullPath);

          if (cmd.name && typeof cmd.execute === 'function') {
            commands.set(cmd.name, cmd);

            if (cmd.aliases) {
              cmd.aliases.forEach(alias => commands.set(alias, cmd));
            }
          }
        } catch (err) {
          console.error('❌ Failed loading:', file, err.message);
        }
      }
    }
  }

  readDir(basePath);
  return commands;
}

module.exports = loadCommands;
