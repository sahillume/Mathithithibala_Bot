const fs = require('fs');
const path = require('path');

function loadCommands() {
  const commands = new Map();

  const commandsPath = path.join(__dirname, '../commands');

  // 🧠 SAFETY: ensure folder exists
  if (!fs.existsSync(commandsPath)) {
    console.log('❌ Commands folder not found!');
    return commands;
  }

  function readDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);

      try {
        const stat = fs.lstatSync(fullPath);

        if (stat.isDirectory()) {
          readDir(fullPath);
        } 
        else if (file.endsWith('.js')) {

          // 🧠 CLEAN CACHE (important for updates)
          delete require.cache[require.resolve(fullPath)];

          const command = require(fullPath);

          if (!command) return;

          // ===============================
          // 📦 REGISTER MAIN COMMAND
          // ===============================
          if (command.name) {
            commands.set(command.name.toLowerCase(), command);
          }

          // ===============================
          // 🔁 REGISTER ALIASES
          // ===============================
          if (Array.isArray(command.aliases)) {
            for (const alias of command.aliases) {
              commands.set(alias.toLowerCase(), command);
            }
          }

        }
      } catch (e) {
        console.log(`❌ Failed loading command: ${file}`);
        console.log(`   ↳ ${e.message}`);
      }
    }
  }

  readDir(commandsPath);

  console.log(`📦 Loaded ${commands.size} command entries`);

  return commands;
}

module.exports = { loadCommands };
