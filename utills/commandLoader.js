const fs = require('fs');
const path = require('path');

// ===============================
// 📦 LOAD COMMANDS
// ===============================
const loadCommands = () => {
  const commands = new Map();

  const commandsPath = path.join(__dirname, '..', 'commands');

  // ===========================
  // 🛑 SAFE CHECK
  // ===========================
  if (!fs.existsSync(commandsPath)) {
    console.log('⚠️ Commands folder not found');
    return commands;
  }

  let totalLoaded = 0;

  // ===========================
  // 📁 CATEGORY LOOP
  // ===========================
  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);

    try {
      if (!fs.statSync(categoryPath).isDirectory()) continue;

      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

      for (const file of files) {
        const filePath = path.join(categoryPath, file);

        try {
          delete require.cache[require.resolve(filePath)];

          const command = require(filePath);

          // ===========================
          // 🧠 VALIDATION
          // ===========================
          if (!command || !command.name || !command.execute) {
            console.log(`⚠️ Skipped invalid command: ${file}`);
            continue;
          }

          commands.set(command.name, command);
          totalLoaded++;

          // Aliases support
          if (Array.isArray(command.aliases)) {
            for (const alias of command.aliases) {
              commands.set(alias, command);
            }
          }

        } catch (err) {
          console.log(`❌ Failed loading ${file}:`, err.message);
        }
      }

    } catch (err) {
      console.log(`❌ Category error (${category}):`, err.message);
    }
  }

  console.log(`✅ Commands loaded: ${totalLoaded}`);

  return commands;
};

module.exports = { loadCommands };
