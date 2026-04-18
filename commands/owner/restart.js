const { exec } = require('child_process');

/**
 * Restart Command - Owner Only
 */

module.exports = {
  name: 'restart',
  aliases: ['reboot', 'reload'],
  category: 'owner',
  description: 'Restart the bot (Owner Only)',
  usage: '.restart',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      await extra.reply('🔁 Restarting bot... Please wait.');

      const run = (cmd) => {
        return new Promise((resolve, reject) => {
          exec(cmd, (error, stdout, stderr) => {
            if (error) return reject(error);
            resolve(stdout || stderr);
          });
        });
      };

      // ===============================
      // TRY PM2 RESTART FIRST
      // ===============================
      try {
        await run('pm2 restart all');
        return;
      } catch (err) {
        console.log('PM2 not available, using process exit fallback...');
      }

      // ===============================
      // FALLBACK RESTART (Panels / Nodemon)
      // ===============================
      await extra.reply('⚙️ Using fallback restart method...');

      setTimeout(() => {
        process.exit(0);
      }, 1000);

    } catch (error) {
      console.error('Restart error:', error);
      return extra.reply(
        `❌ Failed to restart bot:\n${error.message}`
      );
    }
  },
};
