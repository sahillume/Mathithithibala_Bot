module.exports = {

  // 👑 OWNER CONFIG (FIXED CONSISTENCY)
  ownerNumbers: ['27835515085'], // FIXED (was ownerNumber → breaks handler)
  ownerName: 'Professor Sahil',

  // 🤖 BOT CONFIG
  botName: 'Mathithibala Bot',
  prefix: process.env.PREFIX || '.',

  sessionName: 'session',
  sessionID: process.env.SESSION_ID || '',

  // 🔗 SYSTEM LINKS
  newsletterJid: '', // 📢 WhatsApp newsletter ID
  updateZipUrl: '',

  // 🎨 STICKER CONFIG
  packname: 'Mathithibala Bot',
  author: 'Professor Sahil',

  // ⚙️ BOT BEHAVIOR
  selfMode: false,
  autoRead: false,
  autoTyping: true,
  autoBio: false,
  autoSticker: false,
  autoReact: true,
  autoReactMode: 'bot',
  autoDownload: false,

  // 🧠 AI SYSTEM (ENHANCED SAFE VERSION)
  ai: {
    enabled: true,
    smartFallback: true,
    respectPrivacy: true,
    personality: "professional",
    creatorName: "Professor Sahil",
    antiLoop: true
  },

  // 🛡️ GROUP DEFAULT SETTINGS (ENHANCED)
  defaultGroupSettings: {
    antilink: false,
    antilinkAction: 'delete',

    antitag: false,
    antitagAction: 'delete',

    antiall: false,
    antiviewonce: false,
    antibot: false,
    anticall: false,

    antigroupmention: false,
    antigroupmentionAction: 'delete',

    antiSpam: false,
    antidelete: false,
    nsfw: false,
    detect: false,
    chatbot: false,
    autosticker: false,

    welcome: false,
    welcomeMessage: '👋 Welcome @user to @group!',
    goodbye: false,
    goodbyeMessage: '👋 Goodbye @user!'
  },

  // 🔑 API KEYS
  apiKeys: {
    openai: process.env.OPENAI_KEY || '',
    deepai: '',
    remove_bg: ''
  },

  // 💬 SYSTEM MESSAGES (IMPROVED)
  messages: {
    wait: '⏳ Processing...',
    success: '✅ Done!',
    error: '❌ Something went wrong!',

    ownerOnly: '👑 Only Professor Sahil can use this.',
    adminOnly: '🛡️ Admins only!',
    groupOnly: '👥 Groups only!',
    privateOnly: '💬 Private chat only!',
    botAdminNeeded: '🤖 I need admin rights!',
    invalidCommand: '❓ Unknown command. Try .menu'
  },

  // 🌍 TIMEZONE
  timezone: 'Africa/Johannesburg',

  // ⚠️ LIMITS
  maxWarnings: 3,

  // 🌐 SOCIAL LINKS
  social: {
    github: 'https://github.com/sahillume/Mathithithibala_Bot',
    instagram: '',
    youtube: ''
  },

  // 🧠 INTERNAL FLAGS (NEW - USED BY CORE)
  system: {
    version: 'PRO-MAX-1.0',
    logLevel: 'silent',
    antiCrash: true
  }
};
