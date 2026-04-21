module.exports = {

  // 👑 OWNER CONFIG (PUBLIC EDITABLE)
  ownerNumbers: process.env.OWNER_NUMBER
    ? process.env.OWNER_NUMBER.split(',')
    : ['27835515085'],

  ownerName: process.env.OWNER_NAME || 'Professor Sahil',

  // 🤖 BOT CONFIG
  botName: process.env.BOT_NAME || 'Mathithibala Bot',
  prefix: process.env.PREFIX || '.',

  sessionName: 'session',
  sessionID: process.env.SESSION_ID || '',

  // 🔐 PAIR SYSTEM
  pairing: {
    enabled: true, // 🔥 allow pair code login
    autoAskNumber: true // ask number in console
  },

  // 🔗 SYSTEM LINKS
  newsletterJid: process.env.NEWSLETTER_JID || '', // e.g 1203xxx@newsletter
  newsletterName: "Mathithibala Channel",
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

  // 🧠 AI SYSTEM
  ai: {
    enabled: true,
    smartFallback: true,
    respectPrivacy: true,
    personality: "professional",
    creatorName: "Professor Sahil",
    antiLoop: true
  },

  // 🛡️ GROUP DEFAULT SETTINGS
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
    antidelete: false, // 🔥 IMPORTANT
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

  // 💬 SYSTEM MESSAGES
  messages: {
    wait: '⏳ Processing...',
    success: '✅ Done!',
    error: '❌ Something went wrong!',

    ownerOnly: '👑 Only owner can use this.',
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

  // 🧠 SYSTEM FLAGS
  system: {
    version: 'PRO-MAX-2.0',
    logLevel: 'silent',
    antiCrash: true
  }
};
