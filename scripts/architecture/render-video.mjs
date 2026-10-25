import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { build } from 'esbuild';

const root = process.cwd(),
  work = path.join(root, '.work');

fs.mkdirSync(work, { recursive: true });

const bundle = path.join(work, 'video-frame.cjs');

await build({
  entryPoints: ['scripts/architecture/video-frame.tsx'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: bundle,
  logLevel: 'silent',
});

const output = path.resolve(process.argv[2] ?? 'service-desk-ai-silent.mp4');

for (let i = 0; i < 10; i++) {
  const result = spawnSync(
    process.execPath,
    ['--expose-gc', 'scripts/architecture/video-worker.cjs', String(i)],
    { cwd: root, stdio: 'inherit' },
  );
  if (result.status !== 0) throw Error('Video chapter failed: ' + (i + 1));
}

const manifest = path.join(work, 'concat.txt');

fs.writeFileSync(
  manifest,
  Array.from({ length: 10 }, (_, i) => `file '${path.join(work, `scene-${i}.mp4`)}'\n`).join(''),
);
// Complete MP4 seeking and fast-start processing on local scratch, then copy once.
const localDir = fs.mkdtempSync(path.join(os.tmpdir(), 'service-desk-export-')),
  final = path.join(localDir, 'silent.mp4');

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
    '180',
    '-movflags',
    '+faststart',
    final,
  ],
  { stdio: 'inherit' },
);

if (mux.status !== 0) throw Error('Video assembly failed');

fs.copyFileSync(final, output);

fs.rmSync(localDir, { recursive: true });

console.log('Silent video ready: ' + output);
