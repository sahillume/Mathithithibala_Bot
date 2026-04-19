const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ===============================
// 📁 TEMP DIRECTORY (SAFE)
// ===============================
const TEMP_DIR = path.join(process.cwd(), 'temp');

// Ensure temp folder exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// ===============================
// 🔧 CHECK FFMPEG
// ===============================
function checkFFmpeg() {
  try {
    spawn('ffmpeg', ['-version']);
    return true;
  } catch (e) {
    console.log('❌ FFmpeg not installed!');
    return false;
  }
}

// ===============================
// ⚙️ CORE FFMPEG FUNCTION
// ===============================
function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {

      if (!checkFFmpeg()) {
        return reject(new Error('FFmpeg not installed'));
      }

      const tmpFile = path.join(TEMP_DIR, Date.now() + '.' + ext);
      const outFile = tmpFile + '.' + ext2;

      await fs.promises.writeFile(tmpFile, buffer);

      const proc = spawn('ffmpeg', [
        '-y',
        '-i', tmpFile,
        ...args,
        outFile
      ]);

      proc.on('error', (err) => reject(err));

      proc.on('close', async (code) => {
        try {
          await fs.promises.unlink(tmpFile).catch(() => {});
          if (code !== 0) return reject(new Error('FFmpeg failed'));

          const data = await fs.promises.readFile(outFile);
          await fs.promises.unlink(outFile).catch(() => {});

          resolve(data);

        } catch (err) {
          reject(err);
        }
      });

    } catch (err) {
      reject(err);
    }
  });
}

// ===============================
// 🎧 AUDIO
// ===============================
function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-ac', '2',
    '-b:a', '128k',
    '-ar', '44100',
    '-f', 'mp3'
  ], ext, 'mp3');
}

// ===============================
// 🎤 PTT (VOICE NOTE)
// ===============================
function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-compression_level', '10'
  ], ext, 'opus');
}

// ===============================
// 🎥 VIDEO
// ===============================
function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-ab', '128k',
    '-ar', '44100',
    '-crf', '32',
    '-preset', 'fast'
  ], ext, 'mp4');
}

// ===============================
module.exports = {
  toAudio,
  toPTT,
  toVideo,
  ffmpeg
};
