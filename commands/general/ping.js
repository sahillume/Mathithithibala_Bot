/**
 * Ping Command - Bot Speed Test
 * Mathithibala_Bot Pro | Professor Sahil System
 */

module.exports = {
  name: 'ping',
  aliases: ['speed', 'latency', 'botstatus'],
  category: 'general',
  description: 'Check bot response speed',
  usage: '.ping',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      const start = Date.now();

      const sentMsg = await sock.sendMessage(chatId, {
        text: '⚡ Pinging... please wait'
      }, { quoted: msg });

      const end = Date.now();

      const speed = end - start;

      let status;
      if (speed < 200) status = '🚀 Ultra Fast';
      else if (speed < 500) status = '⚡ Fast';
      else if (speed < 1000) status = '🐢 Normal';
      else status = '🐌 Slow';

      await sock.sendMessage(chatId, {
        text:
`⚡ *PONG!*

📶 Speed: ${speed} ms
📊 Status: ${status}

🤖 Bot: Mathithibala_Bot
👑 Owner: Professor Sahil`
      }, { quoted: msg });

    } catch (err) {
      console.log('PING ERROR:', err);
      extra.reply('❌ Ping failed.');
    }
  }
};
