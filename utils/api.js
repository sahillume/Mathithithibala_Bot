const axios = require('axios');

// ===============================
// ⚙️ BASE CONFIG
// ===============================
const api = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

// ===============================
// 🔁 SAFE REQUEST WRAPPER (FIXED)
// ===============================
const safeRequest = async (fn, retries = 2) => {
  let error;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      error = err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw error;
};

// ===============================
// 🌐 API MODULE
// ===============================
const APIs = {

  // ===========================
  // 🤖 AI CHAT
  // ===========================
  chatAI: async (text, config) => {
    return safeRequest(async () => {
      const res = await api.get(
        `https://api.shizo.top/ai/gpt`,
        {
          params: {
            apikey: 'shizo',
            query: text
          }
        }
      );

      return res.data?.msg || res.data;
    });
  },

  // ===========================
  // 🎨 IMAGE GENERATION
  // ===========================
  generateImage: async (prompt) => {
    return safeRequest(async () => {
      const res = await api.get(
        `https://api.siputzx.my.id/api/ai/stablediffusion`,
        { params: { prompt } }
      );
      return res.data;
    });
  },

  // ===========================
  // 🎵 YOUTUBE AUDIO
  // ===========================
  ytAudio: async (url) => {
    return safeRequest(async () => {
      const res = await api.get(
        `https://api.siputzx.my.id/api/d/ytmp3`,
        { params: { url } }
      );
      return res.data;
    });
  },

  // ===========================
  // 🎥 YOUTUBE VIDEO
  // ===========================
  ytVideo: async (url) => {
    return safeRequest(async () => {
      const res = await api.get(
        `https://api.siputzx.my.id/api/d/ytmp4`,
        { params: { url } }
      );
      return res.data;
    });
  },

  // ===========================
  // 📸 INSTAGRAM
  // ===========================
  igDownload: async (url) => {
    return safeRequest(async () => {
      const res = await api.get(
        `https://api.siputzx.my.id/api/d/igdl`,
        { params: { url } }
      );
      return res.data;
    });
  },

  // ===========================
  // 🎵 TIKTOK
  // ===========================
  tiktokDownload: async (url) => {
    return safeRequest(async () => {
      const res = await api.get(
        `https://api.siputzx.my.id/api/d/tiktok`,
        { params: { url } }
      );
      return res.data;
    });
  },

  // ===========================
  // 🌦 WEATHER
  // ===========================
  weather: async (city) => {
    return safeRequest(async () => {
      const res = await api.get(
        `https://api.siputzx.my.id/api/tools/weather`,
        { params: { city } }
      );
      return res.data;
    });
  },

  // ===========================
  // 🌍 TRANSLATE
  // ===========================
  translate: async (text, to = 'en') => {
    return safeRequest(async () => {
      const res = await api.get(
        `https://api.siputzx.my.id/api/tools/translate`,
        { params: { text, to } }
      );
      return res.data;
    });
  },

  // ===========================
  // 😂 MEME
  // ===========================
  meme: async () => {
    return safeRequest(async () => {
      const res = await api.get('https://meme-api.com/gimme');
      return res.data;
    });
  },

  // ===========================
  // 💬 QUOTE
  // ===========================
  quote: async () => {
    return safeRequest(async () => {
      const res = await api.get('https://api.quotable.io/random');
      return res.data;
    });
  },

  // ===========================
  // 😂 JOKE
  // ===========================
  joke: async () => {
    return safeRequest(async () => {
      const res = await api.get(
        'https://official-joke-api.appspot.com/random_joke'
      );
      return res.data;
    });
  },

  // ===========================
  // 🔗 SHORT URL
  // ===========================
  shorten: async (url) => {
    return safeRequest(async () => {
      const res = await api.get(
        'https://tinyurl.com/api-create.php',
        { params: { url } }
      );
      return res.data;
    });
  }
};

module.exports = APIs;
