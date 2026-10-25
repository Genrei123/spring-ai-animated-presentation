const fs = require('node:fs');

const path = require('node:path');

const { spawn } = require('node:child_process');

const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');

const { draw } = require('./canvas-frame.cjs');

for (const [font, alias] of [
  ['/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf', 'Arial'],
  ['/usr/share/fonts/opentype/urw-base35/NimbusSans-Bold.otf', 'Arial'],
])
  if (fs.existsSync(font)) GlobalFonts.registerFromPath(font, alias);

const scene = Number(process.argv[2]),
  fps = 20,
  work = path.join(process.cwd(), '.work'),
  canvas = createCanvas(1280, 720),
  ctx = canvas.getContext('2d');

const ff = spawn(
  'ffmpeg',
  [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-f',
    'rawvideo',
    '-pixel_format',
    'rgba',
    '-video_size',
    '1280x720',
    '-framerate',
    String(fps),
    '-i',
    'pipe:0',
    '-an',
    '-c:v',
    'libx264',
    '-threads',
    '2',
    '-preset',
    'fast',
    '-crf',
    '20',
    '-pix_fmt',
    'yuv420p',
    '-t',
    '18',
    '-movflags',
    '+faststart',
    path.join(work, `scene-${scene}.mp4`),
  ],
  { stdio: ['pipe', 'inherit', 'inherit'] },
);

async function main() {
  console.log('Rendering scene ' + (scene + 1) + '/10');
  for (let f = 0; f < 18 * fps; f++) {
    draw(ctx, scene * 18 + f / fps);
    const pixels = ctx.getImageData(0, 0, 1280, 720).data,
      raw = Buffer.from(pixels.buffer, pixels.byteOffset, pixels.byteLength);
    if (!ff.stdin.write(raw)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 40 === 0 && global.gc) global.gc();
  }
  ff.stdin.end();
  await new Promise((resolve, reject) =>
    ff.on('exit', (code) => (code === 0 ? resolve() : reject(Error('FFmpeg failed: ' + code)))),
  );
  console.log('Scene ' + (scene + 1) + ' ready');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
