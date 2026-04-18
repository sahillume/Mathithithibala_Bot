/**
 * Weather Command - Get weather information using OpenWeather API
 */

const axios = require('axios');

module.exports = {
  name: 'weather',
  aliases: ['w', 'clima'],
  category: 'utility',
  description: 'Get weather for a city',
  usage: '.weather <city>',

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;

      if (!args.length) {
        return await sock.sendMessage(
          jid,
          {
            text: `❌ Usage: .weather <city>\n\nExample: .weather London`
          },
          { quoted: msg }
        );
      }

      const city = args.join(' ');
      const apiKey = '4902c0f2550f58298ad4146a92b65e10';

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

      const { data } = await axios.get(url);

      const weatherText = `
🌍 Weather Report: ${data.name}

🌤 Condition: ${data.weather[0].main} (${data.weather[0].description})
🌡 Temperature: ${data.main.temp}°C
🤒 Feels Like: ${data.main.feels_like}°C
💧 Humidity: ${data.main.humidity}%
🌬 Wind Speed: ${data.wind.speed} m/s

📍 Country: ${data.sys.country}
      `.trim();

      await sock.sendMessage(
        jid,
        { text: weatherText },
        { quoted: msg }
      );

    } catch (error) {
      console.error('Weather Error:', error.message);

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `❌ Could not fetch weather for that location.\n\nMake sure the city name is correct.`
        },
        { quoted: msg }
      );
    }
  }
};
