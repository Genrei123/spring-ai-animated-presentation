import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { build } from 'esbuild';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url),
  root = process.cwd(),
  work = path.join(root, '.work/data-flow');

fs.mkdirSync(work, { recursive: true });

await build({
  entryPoints: ['scripts/data-flow/flow-frame.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: path.join(work, 'engine.cjs'),
  logLevel: 'silent',
});

if (process.argv.includes('--stills')) {
  const { createCanvas, GlobalFonts } = require('@napi-rs/canvas'),
    { drawFlow, defaultFlowOptions, examples } = require(path.join(work, 'engine.cjs'));
  for (const font of [
    '/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf',
    '/usr/share/fonts/opentype/urw-base35/NimbusSans-Bold.otf',
  ])
    if (fs.existsSync(font)) GlobalFonts.registerFromPath(font, 'Arial');
  const canvas = createCanvas(1600, 900),
    ctx = canvas.getContext('2d');
  for (let i = 0; i < 11; i++) {
    drawFlow(ctx, i * 14 + 10, defaultFlowOptions);
    fs.writeFileSync(path.join(work, 'scene-' + i + '.png'), canvas.toBuffer('image/png'));
  }
  drawFlow(ctx, 153, { example: 'access', prompt: examples.access.question });
  fs.writeFileSync(path.join(work, 'access-answer.png'), canvas.toBuffer('image/png'));
  drawFlow(ctx, 153, { example: 'vpn', prompt: 'How do I fix a printer?' });
  fs.writeFileSync(path.join(work, 'fallback.png'), canvas.toBuffer('image/png'));
  console.log('Data-flow stills ready');
  process.exit();
}

const output = path.resolve(process.argv[2] ?? 'service-desk-data-flow.mp4');

for (let i = 0; i < 11; i++) {
  const r = spawnSync(
    process.execPath,
    ['--expose-gc', 'scripts/data-flow/flow-worker.cjs', String(i)],
    {
      cwd: root,
      stdio: 'inherit',
    },
  );
  if (r.status !== 0) throw Error('Flow scene failed: ' + i);
}

const manifest = path.join(work, 'concat.txt');

fs.writeFileSync(
  manifest,
  Array.from({ length: 11 }, (_, i) => `file '${path.join(work, `video-${i}.mp4`)}'\n`).join(''),
);

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'data-flow-')),
  complete = path.join(temp, 'complete.mp4');

const mux = spawnSync(
  'ffmpeg',
  [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    manifest,
    '-an',
    '-c:v',
    'copy',
    '-t',
    '154',
    '-movflags',
    '+faststart',
    complete,
  ],
  { stdio: 'inherit' },
);

if (mux.status !== 0) throw Error('Flow video assembly failed');

fs.copyFileSync(complete, output);

fs.rmSync(temp, { recursive: true });

console.log('Silent data-flow video ready: ' + output);
