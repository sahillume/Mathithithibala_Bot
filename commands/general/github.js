/**
 * GitHub Command - Repository Info Viewer
 * Mathithibala_Bot Pro | Professor Sahil System
 */

const axios = require("axios");

module.exports = {
  name: "github",
  aliases: ["git", "repo", "gitinfo"],
  category: "general",
  description: "Fetch GitHub repository information",
  usage: ".github",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      // Your repo (fixed)
      const repo = "sahillume/Mathithithibala_Bot";

      await extra.reply("🔎 Fetching GitHub repository info...");

      const url = `https://api.github.com/repos/${repo}`;

      const res = await axios.get(url, {
        headers: {
          "Accept": "application/vnd.github+json"
        }
      });

      const data = res.data;

      const text =
`🐙 *GITHUB REPOSITORY INFO*

📁 Name: ${data.name}
👤 Owner: ${data.owner.login}
⭐ Stars: ${data.stargazers_count}
🍴 Forks: ${data.forks_count}
🐛 Issues: ${data.open_issues_count}

📄 Language: ${data.language || "N/A"}
📅 Created: ${new Date(data.created_at).toDateString()}
🔄 Updated: ${new Date(data.updated_at).toDateString()}

🔗 URL: ${data.html_url}

🤖 Bot: Mathithibala_Bot
👑 Owner: Professor Sahil`;

      await sock.sendMessage(chatId, {
        text
      }, { quoted: msg });

    } catch (err) {
      console.log("GITHUB ERROR:", err);
      extra.reply("❌ Failed to fetch GitHub repository info.");
    }
  }
};
