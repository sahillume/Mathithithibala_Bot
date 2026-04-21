const axios = require('axios');

// ===============================
// ⚙️ BASE AXIOS INSTANCE (PRO MAX)
// ===============================
const api = axios.create({
  timeout: 25000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    Accept: 'application/json, text/plain, */*'
  }
});

// ===============================
// 🔁 SMART RETRY ENGINE (UPGRADED)
// ===============================
const safeRequest = async (fn, retries = 3) => {
  let lastError;

  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fn();

      if (!res) throw new Error('Empty response');

      // 🔥 AUTO JSON VALIDATION
      const data = res.data;

      if (data === undefined || data === null) {
        throw new Error('Invalid API response');
      }

      return data;

    } catch (err) {
      lastError = err;

      // 🔥 SMART BACKOFF (faster + stable)
      const delay = 800 * (i + 1);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  throw lastError;
};

// ===============================
// 🌐 API ENGINE (PRO MAX VERSION)
// ===============================
const APIs = {

  // 🤖 AI CHAT (IMPROVED)
  chatAI: async (text) => {
    try {
      const data = await safeRequest(() =>
        api.get(`https://api.shizo.top/ai/gpt`, {
          params: {
            apikey: 'shizo',
            query: text
          }
        })
      );

      return data?.msg || '⚠️ AI failed';
    } catch {
      return '❌ AI unavailable';
    }
  },

  // 🎨 IMAGE GENERATION
  generateImage: async (prompt) => {
    try {
      const data = await safeRequest(() =>
        api.get(`https://api.siputzx.my.id/api/ai/stablediffusion`, {
          params: { prompt }
        })
      );

      return data?.result || null;
    } catch {
      return null;
    }
  },

  // 🎵 YT AUDIO
  ytAudio: async (url) => {
    try {
      const data = await safeRequest(() =>
        api.get(`https://api.siputzx.my.id/api/d/ytmp3`, {
          params: { url }
        })
      );

      return data?.result || null;
    } catch {
      return null;
    }
  },

  // 🎥 YT VIDEO
  ytVideo: async (url) => {
    try {
      const data = await safeRequest(() =>
        api.get(`https://api.siputzx.my.id/api/d/ytmp4`, {
          params: { url }
        })
      );

      return data?.result || null;
    } catch {
      return null;
    }
  },

  // 📸 IG
  igDownload: async (url) => {
    try {
      const data = await safeRequest(() =>
        api.get(`https://api.siputzx.my.id/api/d/igdl`, {
          params: { url }
        })
      );

      return data?.result || null;
    } catch {
      return null;
    }
  },

  // 🎵 TIKTOK
  tiktokDownload: async (url) => {
    try {
      const data = await safeRequest(() =>
        api.get(`https://api.siputzx.my.id/api/d/tiktok`, {
          params: { url }
        })
      );

      return data?.result || null;
    } catch {
      return null;
    }
  },

  // 🌦 WEATHER
  weather: async (city) => {
    try {
      const data = await safeRequest(() =>
        api.get(`https://api.siputzx.my.id/api/tools/weather`, {
          params: { city }
        })
      );

      return data?.result || null;
    } catch {
      return null;
    }
  },

  // 🌍 TRANSLATE
  translate: async (text, to = 'en') => {
    try {
      const data = await safeRequest(() =>
        api.get(`https://api.siputzx.my.id/api/tools/translate`, {
          params: { text, to }
        })
      );

      return data?.result || text;
    } catch {
      return text;
    }
  },

  // 😂 MEME
  meme: async () => {
    try {
      const data = await safeRequest(() =>
        api.get('https://meme-api.com/gimme')
      );

      return data || null;
    } catch {
      return null;
    }
  },

  // 💬 QUOTE
  quote: async () => {
    try {
      const data = await safeRequest(() =>
        api.get('https://api.quotable.io/random')
      );

      return data || null;
    } catch {
      return null;
    }
  },

  // 😂 JOKE
  joke: async () => {
    try {
      const data = await safeRequest(() =>
        api.get('https://official-joke-api.appspot.com/random_joke')
      );

      return data || null;
    } catch {
      return null;
    }
  },

  // 🔗 SHORT LINK
  shorten: async (url) => {
    try {
      const data = await safeRequest(() =>
        api.get('https://tinyurl.com/api-create.php', {
          params: { url }
        })
      );

      return typeof data === 'string' ? data : null;
    } catch {
      return null;
    }
  }
};

module.exports = APIs;
