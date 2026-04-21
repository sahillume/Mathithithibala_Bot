const fs = require('fs');
const path = require('path');

function loadCommands() {
  const commands = new Map();

  const commandsPath = path.join(__dirname, '../commands');

  // ===============================
  // 🧠 CHECK FOLDER
  // ===============================
  if (!fs.existsSync(commandsPath)) {
    console.log('❌ Commands folder not found!');
    return commands;
  }

  // ===============================
  // 🔁 READ DIRECTORY RECURSIVELY
  // ===============================
  function readDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);

      try {
        const stat = fs.lstatSync(fullPath);

        // 📁 If folder → scan inside
        if (stat.isDirectory()) {
          readDir(fullPath);
          continue;
        }

        // 📄 Only .js files
        if (!file.endsWith('.js')) continue;

        // 🧠 CLEAR CACHE (HOT RELOAD SAFE)
        delete require.cache[require.resolve(fullPath)];

        const command = require(fullPath);

        // ❌ Skip invalid commands (DO NOT BREAK LOOP)
        if (!command || !command.name) {
          console.log(`⚠️ Skipped invalid command: ${file}`);
          continue;
        }

        // ===============================
        // 📦 REGISTER MAIN COMMAND
        // ===============================
        commands.set(command.name.toLowerCase(), command);

        // ===============================
        // 🔁 REGISTER ALIASES
        // ===============================
        if (Array.isArray(command.aliases)) {
          for (const alias of command.aliases) {
            commands.set(alias.toLowerCase(), command);
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
