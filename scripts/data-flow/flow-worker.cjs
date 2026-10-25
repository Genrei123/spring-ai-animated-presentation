const fs = require('node:fs'),
  path = require('node:path'),
  { spawn } = require('node:child_process'),
  { createCanvas, GlobalFonts } = require('@napi-rs/canvas');

const { drawFlow, defaultFlowOptions } = require('../../.work/data-flow/engine.cjs');

for (const f of [
  '/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf',
  '/usr/share/fonts/opentype/urw-base35/NimbusSans-Bold.otf',
])
  if (fs.existsSync(f)) GlobalFonts.registerFromPath(f, 'Arial');

const scene = Number(process.argv[2]),
  fps = 20,
  canvas = createCanvas(1600, 900),
  ctx = canvas.getContext('2d'),
  out = createCanvas(1280, 720),
  o = out.getContext('2d');

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
    '14',
    '-movflags',
    '+faststart',
    path.join(process.cwd(), `.work/data-flow/video-${scene}.mp4`),
  ],
  { stdio: ['pipe', 'inherit', 'inherit'] },
);

async function main() {
  console.log(`Rendering flow stage ${scene + 1}/11`);
  for (let f = 0; f < 14 * fps; f++) {
    drawFlow(ctx, scene * 14 + f / fps, defaultFlowOptions);
    o.drawImage(canvas, 0, 0, 1280, 720);
    const p = o.getImageData(0, 0, 1280, 720).data;
    if (!ff.stdin.write(Buffer.from(p.buffer, p.byteOffset, p.byteLength)))
      await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 20 === 0 && global.gc) global.gc();
  }
  ff.stdin.end();
  await new Promise((resolve, reject) =>
    ff.on('exit', (code) => (code === 0 ? resolve() : reject(Error('FFmpeg failed: ' + code)))),
  );
  console.log(`Flow stage ${scene + 1} ready`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
