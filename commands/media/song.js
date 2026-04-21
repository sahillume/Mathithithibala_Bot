/**
 * Song Downloader - Download audio from YouTube
 */

const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const APIs = require('../../utils/api');
const { toAudio } = require('../../utils/converter');

module.exports = {
  name: 'song',
  aliases: ['play', 'music', 'yta'],
  category: 'media',
  description: 'Download audio from YouTube',
  usage: '.song <song name or YouTube link>',
  
  async execute(sock, msg, args) {
    try {
      const text = args.join(' ');
      const chatId = msg.key.remoteJid;
      
      if (!text) {
        return await sock.sendMessage(chatId, { 
          text: 'Usage: .song <song name or YouTube link>' 
        }, { quoted: msg });
      }
      
      let video;
      
      if (text.includes('youtube.com') || text.includes('youtu.be')) {
        video = { url: text };
      } else {
        const search = await yts(text);
        if (!search || !search.videos.length) {
          return await sock.sendMessage(chatId, { 
            text: 'No results found.' 
          }, { quoted: msg });
        }
        video = search.videos[0];
      }

      // ⏳ LOADING MESSAGE (ADDED)
      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail },
        caption: `🎵 Downloading: *${video.title}*\n⏱ Duration: ${video.timestamp}\n\n⏳ *Mathithibala_Bot Pro AI is still downloading your song...*\n⏳ Please wait approximately 30 seconds.`
      }, { quoted: msg });
      
      // Try multiple APIs with fallback chain
      let audioData;
      let audioBuffer;
      let downloadSuccess = false;
      
      const apiMethods = [
        { name: 'EliteProTech', method: () => APIs.getEliteProTechDownloadByUrl(video.url) },
        { name: 'Yupra', method: () => APIs.getYupraDownloadByUrl(video.url) },
        { name: 'Okatsu', method: () => APIs.getOkatsuDownloadByUrl(video.url) },
        { name: 'Izumi', method: () => APIs.getIzumiDownloadByUrl(video.url) }
      ];
      
      for (const apiMethod of apiMethods) {
        try {
          audioData = await apiMethod.method();
          const audioUrl = audioData.download || audioData.dl || audioData.url;
          
          if (!audioUrl) continue;

          try {
            const audioResponse = await axios.get(audioUrl, {
              responseType: 'arraybuffer',
              timeout: 90000,
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
              validateStatus: s => s >= 200 && s < 400,
              headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': '*/*',
                'Accept-Encoding': 'identity'
              }
            });

            audioBuffer = Buffer.from(audioResponse.data);

            if (audioBuffer && audioBuffer.length > 0) {
              downloadSuccess = true;
              break;
            }

          } catch (e) {
            continue;
          }

        } catch (e) {
          continue;
        }
      }
      
      if (!downloadSuccess || !audioBuffer) {
        throw new Error('All download sources failed.');
      }

      if (!audioBuffer || audioBuffer.length < 1000) {
        throw new Error('Invalid audio buffer');
      }

      // Detect format
      const firstBytes = audioBuffer.slice(0, 12);
      const asciiSignature = firstBytes.toString('ascii', 4, 8);

      let fileExtension = 'mp3';

      if (asciiSignature === 'ftyp') fileExtension = 'm4a';
      else if (audioBuffer.toString('ascii', 0, 3) === 'ID3') fileExtension = 'mp3';
      else if (audioBuffer.toString('ascii', 0, 4) === 'OggS') fileExtension = 'ogg';
      else if (audioBuffer.toString('ascii', 0, 4) === 'RIFF') fileExtension = 'wav';
      else fileExtension = 'm4a';

      let finalBuffer = audioBuffer;
      let finalExtension = 'mp3';

      if (fileExtension !== 'mp3') {
        finalBuffer = await toAudio(audioBuffer, fileExtension);
        finalExtension = 'mp3';
      }

      // 📤 SEND AUDIO
      await sock.sendMessage(chatId, {
        audio: finalBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.${finalExtension}`,
        ptt: false
      }, { quoted: msg });

      // 🎉 SUCCESS MESSAGE (ADDED)
      await sock.sendMessage(chatId, {
        text: `🎉 Your song has been downloaded successfully!\n\n🎧 *${video.title}*\n\n🤖 Downloaded by MTB Pro AI\n👨‍🏫 Prof Sahil`
      });

      // cleanup (unchanged)
      try {
        const tempDir = path.join(__dirname, '../../temp');
        if (fs.existsSync(tempDir)) {
          const files = fs.readdirSync(tempDir);
          const now = Date.now();

          files.forEach(file => {
            const filePath = path.join(tempDir, file);
            try {
              const stats = fs.statSync(filePath);
              if (now - stats.mtimeMs > 10000) {
                if (file.endsWith('.mp3') || file.endsWith('.m4a')) {
                  fs.unlinkSync(filePath);
                }
              }
            } catch {}
          });
        }
      } catch {}

    } catch (err) {
      console.log('Song Error:', err);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to download song. Try another one.'
      });
    }
  }
};
