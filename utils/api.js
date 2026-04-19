const axios = require('axios');

// ===============================
// ⚙️ BASE AXIOS INSTANCE
// ===============================
const api = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

// ===============================
// 🔁 SAFE REQUEST ENGINE (IMPROVED)
// ===============================
const safeRequest = async (fn, retries = 3, delay = 1000) => {
  let error;

  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fn();

      if (!res) throw new Error('Empty response');

      return res;
    } catch (err) {
      error = err;

      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }

  throw error;
};

// ===============================
// 🌐 API ENGINE (PRO STABLE)
// ===============================
const APIs = {

  // ===========================
  // 🤖 AI CHAT (FALLBACK SYSTEM)
  // ===========================
  chatAI: async (text) => {
    return safeRequest(async () => {
      const res = await api.get(`https://api.shizo.top/ai/gpt`, {
        params: {
          apikey: 'shizo',
          query: text
        }
      });

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

      return res.data?.result || res.data;
    });
  },

  // ===========================
  // 🎵 YOUTUBE AUDIO (FIXED SAFE OUTPUT)
  // ===========================
  ytAudio: async (url) => {
    return safeRequest(async () => {
      const res = await api.get(
        `https://api.siputzx.my.id/api/d/ytmp3`,
        { params: { url } }
      );

      return res.data?.result || res.data;
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

      return res.data?.result || res.data;
    });
  },

  // ===========================
  // 📸 INSTAGRAM (SAFE PARSE)
  // ===========================
  igDownload: async (url) => {
    return safeRequest(async () => {
      const res = await api.get(
        `https://api.siputzx.my.id/api/d/igdl`,
        { params: { url } }
      );

      return res.data?.result || res.data;
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

      return res.data?.result || res.data;
    });
  },

  // ===========================
  // 🌦 WEATHER (SAFE)
  // ===========================
  weather: async (city) => {
    return safeRequest(async () => {
      const res = await api.get(
        `https://api.siputzx.my.id/api/tools/weather`,
        { params: { city } }
      );

      return res.data?.result || res.data;
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

      return res.data?.result || res.data;
    });
  },

  // ===========================
  // 😂 MEME (FALLBACK SAFE)
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
  // 🔗 SHORT URL (FALLBACK SAFE)
  // ===========================
  shorten: async (url) => {
    return safeRequest(async () => {
      const res = await api.get(
        'https://tinyurl.com/api-create.php',
        { params: { url } }
      );

      return typeof res.data === 'string' ? res.data : null;
    });
  }
};

module.exports = APIs;
