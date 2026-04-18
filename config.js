module.exports = {

  // 👑 OWNER CONFIG
  ownerNumber: ['27835515085'],
  ownerName: 'Professor Sahil',

  // 🤖 BOT CONFIG
  botName: 'Mathithibala Bot',
  prefix: process.env.PREFIX || '.',

  sessionName: 'session',
  sessionID: process.env.SESSION_ID || '',

  // 🔗 SYSTEM LINKS
  newsletterJid: '',
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

  // 🧠 AI SYSTEM (NEW 🔥)
  ai: {
    enabled: true,
    smartFallback: true,
    respectPrivacy: true,
    personality: "professional",
    creatorName: "Professor Sahil"
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
    welcome: false,
    welcomeMessage: '👋 Welcome @user to @group!',
    goodbye: false,
    goodbyeMessage: '👋 Goodbye @user!',
    antiSpam: false,
    antidelete: false,
    nsfw: false,
    detect: false,
    chatbot: false,
    autosticker: false
  },

  // 🔑 API KEYS
  apiKeys: {
    openai: process.env.OPENAI_KEY || '',
    deepai: '',
    remove_bg: ''
  },

  // 💬 MESSAGES
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

  // 🌐 SOCIALS
  social: {
    github: 'https://github.com/sahillume/Mathithithibala_Bot',
    instagram: '',
    youtube: ''
  }

};
