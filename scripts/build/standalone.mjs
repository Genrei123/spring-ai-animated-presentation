import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

let html = fs.readFileSync('dist/index.html', 'utf8');

html = html.replace(
  /<script[^>]*src="([^"]+)"[^>]*><\/script>/g,
  (_, src) =>
    '<script type="module">' +
    fs.readFileSync(path.join(root, 'dist', src), 'utf8').replace(/<\/script/gi, '<\\/script') +
    '</script>',
);

html = html.replace(
  /<link[^>]*href="([^"]+\.css)"[^>]*>/g,
  (_, src) => '<style>' + fs.readFileSync(path.join(root, 'dist', src), 'utf8') + '</style>',
);

fs.writeFileSync('dist/index.html', html);

const flow = html.replace(
  '<head>',
  '<head><script>if(!location.hash)history.replaceState(null,"","#flows")</script>',
);

fs.writeFileSync('dist/data-flow.html', flow);

const builder = html.replace(
  '<head>',
  '<head><script>if(!location.hash)history.replaceState(null,"","#builder")</script>',
);
fs.writeFileSync('dist/component-builder.html', builder);

console.log('Self-contained architecture, data-flow, and component-builder presentations ready.');
