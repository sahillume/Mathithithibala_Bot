/**
 * Lyrics Finder (FIXED + RELIABLE VERSION)
 */

const axios = require('axios');
const config = require('../../config');

async function fetchFromApis(query) {
  let data = null;

  // -------------------------
  // API 1: Vreden
  // -------------------------
  try {
    const res = await axios.get(
      `https://api.vreden.my.id/api/lyrics?query=${encodeURIComponent(query)}`,
      { timeout: 10000 }
    );

    const r = res.data?.result;
    if (r?.lyrics) {
      return {
        title: r.title || 'Unknown Title',
        artist: r.artist || 'Unknown Artist',
        lyrics: r.lyrics,
        thumbnail: r.thumbnail || null
      };
    }
  } catch (e) {}

  // -------------------------
  // API 2: Siputzx
  // -------------------------
  try {
    const res = await axios.get(
      `https://api.siputzx.my.id/api/s/lyrics?query=${encodeURIComponent(query)}`,
      { timeout: 10000 }
    );

    const r = res.data?.data;
    if (res.data?.status && r?.lyrics) {
      return {
        title: r.title || 'Unknown Title',
        artist: r.artist || 'Unknown Artist',
        lyrics: r.lyrics,
        thumbnail: r.image || null
      };
    }
  } catch (e) {}

  // -------------------------
  // API 3: Lyrics.ovh (GLOBAL fallback)
  // -------------------------
  try {
    const res = await axios.get(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(query.split(' ')[0])}/${encodeURIComponent(query.split(' ').slice(1).join(' '))}`,
      { timeout: 10000 }
    );

    if (res.data?.lyrics) {
      return {
        title: query,
        artist: 'Unknown Artist',
        lyrics: res.data.lyrics,
        thumbnail: null
      };
    }
  } catch (e) {}

  return null;
}

module.exports = {
  name: 'lyrics',
  aliases: ['lyric', 'lirik'],
  category: 'media',
  description: 'Get lyrics of a song',
  usage: '<song name>',

  async execute(sock, msg, args, extra) {
    try {
      const jid = msg.key.remoteJid;

      if (!args.length) {
        return sock.sendMessage(jid, {
          text: `❌ Please provide a song name!\n\nExample: ${config.prefix}lyrics Blinding Lights`
        });
      }

      const query = args.join(' ');

      await sock.sendMessage(jid, {
        react: { text: '🔎', key: msg.key }
      });

      const lyricsData = await fetchFromApis(query);

      if (!lyricsData) {
        return sock.sendMessage(jid, {
          text: '❌ Lyrics not found for this song.'
        });
      }

      let lyrics = lyricsData.lyrics;

      // limit safe message size
      if (lyrics.length > 3500) {
        lyrics = lyrics.substring(0, 3500) + '\n\n... (truncated)';
      }

      const caption =
`🎵 *${lyricsData.title}*
👤 Artist: ${lyricsData.artist}

📝 Lyrics:
${lyrics}

━━━━━━━━━━━━━━
✅ Successfully fetched by *Mathithibala_Bot Inspired By Professor Sahil*`;

      if (lyricsData.thumbnail) {
        await sock.sendMessage(jid, {
          image: { url: lyricsData.thumbnail },
          caption
        });
      } else {
        await sock.sendMessage(jid, { text: caption });
      }

    } catch (error) {
      console.error('Lyrics error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Error while fetching lyrics. Try again later.'
      });
    }
  }
};
