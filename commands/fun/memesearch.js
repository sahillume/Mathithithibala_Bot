/**
 * Meme Search Command - Fetch memes from Reddit
 * Mathithibala_Bot Pro | Professor Sahil System
 */

const axios = require("axios");

module.exports = {
  name: "memesearch",
  aliases: ["meme", "memes"],
  category: "fun",
  description: "Search and send memes",
  usage: ".meme <keyword (optional)>",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;
      const query = args.join(" ");

      await extra.reply("😂 Searching for memes...");

      // Choose subreddit based on keyword
      const subreddit = query
        ? "memes"
        : ["memes", "dankmemes", "funny"][
            Math.floor(Math.random() * 3)
          ];

      const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=50`;

      const res = await axios.get(url);

      const posts = res.data.data.children;

      const images = posts
        .map(p => p.data)
        .filter(p =>
          p.post_hint === "image" &&
          !p.over_18 &&
          (query
            ? p.title.toLowerCase().includes(query.toLowerCase())
            : true)
        );

      if (!images.length) {
        return extra.reply("❌ No memes found for your search.");
      }

      const meme = images[Math.floor(Math.random() * images.length)];

      await sock.sendMessage(chatId, {
        image: { url: meme.url },
        caption:
`😂 *MEME FOUND*

📝 ${meme.title}

👍 ${meme.ups} upvotes
💬 ${meme.num_comments} comments

🤖 Mathithibala_Bot`
      }, { quoted: msg });

    } catch (err) {
      console.log("MEME ERROR:", err);
      extra.reply("❌ Failed to fetch meme.");
    }
  }
};
