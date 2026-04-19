/**
 * Sahil Pro Auto Status React
 */

module.exports = {
  name: 'autostatusreact',
  category: 'sahilPro',

  async execute(sock, update) {
    try {
      const { status, jid } = update;

      if (!status) return;

      const reactions = ['🔥', '⚡', '💯', '👑', '🚀'];

      const react = reactions[Math.floor(Math.random() * reactions.length)];

      await sock.sendMessage(jid, {
        react: { text: react, key: update.key }
      });

    } catch (e) {
      console.log(e);
    }
  }
};
