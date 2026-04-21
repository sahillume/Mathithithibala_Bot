const fs = require('fs');
const path = require('path');

// 🔥 BOT IDENTITY (OPTIONAL DEBUG TAG)
const BOT_NAME = 'Mathithibala_Bot';

function loadCommands() {
  const commands = new Map();
  const seenFiles = new Set();

  const commandsPath = path.join(__dirname, '../commands');

  // ===============================
  // 🧠 CHECK FOLDER
  // ===============================
  if (!fs.existsSync(commandsPath)) {
    console.log(`❌ [${BOT_NAME}] Commands folder not found!`);
    return commands;
  }

  // ===============================
  // 🔁 SAFE RECURSIVE LOADER
  // ===============================
  function readDir(dir) {
    let files = [];

    try {
      files = fs.readdirSync(dir);
    } catch (err) {
      console.log(`❌ [${BOT_NAME}] Cannot read directory: ${dir}`);
      return;
    }

    for (const file of files) {
      const fullPath = path.join(dir, file);

      if (seenFiles.has(fullPath)) continue;
      seenFiles.add(fullPath);

      let stat;

      try {
        stat = fs.lstatSync(fullPath);
      } catch (err) {
        console.log(`⚠️ [${BOT_NAME}] Skip unreadable file: ${file}`);
        continue;
      }

      // 📁 Folder recursion
      if (stat.isDirectory()) {
        readDir(fullPath);
        continue;
      }

      // 📄 Only JS files
      if (!file.endsWith('.js')) continue;

      try {
        // 🧠 HOT RELOAD SAFE
        delete require.cache[require.resolve(fullPath)];

        const command = require(fullPath);

        // ❌ Validate command
        if (!command || typeof command !== 'object') {
          console.log(`⚠️ [${BOT_NAME}] Invalid command file: ${file}`);
          continue;
        }

        if (!command.name) {
          console.log(`⚠️ [${BOT_NAME}] Missing name: ${file}`);
          continue;
        }

        const name = command.name.toLowerCase();

        // ===============================
        // 🚫 DUPLICATE PROTECTION
        // ===============================
        if (commands.has(name)) {
          console.log(`⚠️ [${BOT_NAME}] Duplicate command ignored: ${name}`);
          continue;
        }

        commands.set(name, command);

        // ===============================
        // 🔁 ALIASES
        // ===============================
        if (Array.isArray(command.aliases)) {
          for (const alias of command.aliases) {
            const a = alias.toLowerCase();

            if (!commands.has(a)) {
              commands.set(a, command);
            }
          }
        }

      } catch (err) {
        console.log(`❌ [${BOT_NAME}] Failed loading: ${file}`);
        console.log(`   ↳ ${err.message}`);
      }
    }
  }

  readDir(commandsPath);

  // ===============================
  // 📦 FINAL REPORT
  // ===============================
  console.log(`
━━━━━━━━━━━━━━━━━━━━
🤖 ${BOT_NAME}
📦 Commands Loaded: ${commands.size}
━━━━━━━━━━━━━━━━━━━━
`);

  return commands;
}

module.exports = { loadCommands };
