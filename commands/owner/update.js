const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const config = require('../../config');

const CURRENT_VERSION = config.version || '1.0.0';

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve(stdout);
    });
  });
}

function clearRequireCache(dir) {
  for (const key in require.cache) {
    if (key.includes(dir)) {
      delete require.cache[key];
    }
  }
}

async function download(url, dest) {
  const client = url.startsWith('https') ? https : http;

  return new Promise((resolve, reject) => {
    client.get(url, res => {
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    });
  });
}

module.exports = {
  name: 'update',
  aliases: ['upgrade', 'u'],
  category: 'owner',
  description: 'Hot update bot without full reset',
  usage: '.update',

  async execute(sock, msg, args, extra) {
    const chatId = msg.key.remoteJid;

    try {
      const zipUrl = args[0] || config.updateZipUrl;

      if (!zipUrl) {
        return extra.reply('❌ No update URL set.');
      }

      await extra.reply(`🔄 Checking updates...\nCurrent Version: ${CURRENT_VERSION}`);

      const tmpZip = path.join(process.cwd(), 'tmp_update.zip');

      await download(zipUrl, tmpZip);

      const extractDir = path.join(process.cwd(), 'update_temp');

      if (fs.existsSync(extractDir)) {
        fs.rmSync(extractDir, { recursive: true, force: true });
      }

      await run(`unzip -o "${tmpZip}" -d "${extractDir}"`);

      // copy files except important runtime folders
      const ignore = ['node_modules', 'session', 'database', 'tmp'];

      function copy(src, dest) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

        for (const file of fs.readdirSync(src)) {
          if (ignore.includes(file)) continue;

          const s = path.join(src, file);
          const d = path.join(dest, file);

          if (fs.lstatSync(s).isDirectory()) {
            copy(s, d);
          } else {
            fs.copyFileSync(s, d);
          }
        }
      }

      copy(extractDir, process.cwd());

      // 🔥 HOT RELOAD (NO FULL RESET)
      clearRequireCache(process.cwd());

      fs.rmSync(tmpZip, { force: true });
      fs.rmSync(extractDir, { recursive: true, force: true });

      const newVersion = config.newVersion || '2.0.0';

      await sock.sendMessage(chatId, {
        text:
`✅ *UPDATE COMPLETE (HOT RELOAD)*

🔁 Old Version: ${CURRENT_VERSION}
🚀 New Version: ${newVersion}

⚡ Bot updated without restart!
🧠 Modules reloaded successfully.`
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(chatId, {
        text: `❌ Update failed:\n${err.message}`
      }, { quoted: msg });
    }
  }
};
