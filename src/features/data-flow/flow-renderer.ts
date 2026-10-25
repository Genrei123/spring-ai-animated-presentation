import {
  examples,
  vectors,
  flowScenes,
  flowIndex,
  flowEase,
  hasEvidence,
  flowAnswer,
  type FlowOptions,
} from './flow-data';
import { layoutText, type MeasureText } from '../../shared/text-layout';

export type Hotspot = { id: string; x: number; y: number; w: number; h: number; fixed?: boolean };

const C = {
  paper: '#f7fafc',
  white: '#fff',
  ink: '#263d52',
  muted: '#71869a',
  line: '#d5e1eb',
  blue: '#426f9d',
  green: '#287b68',
  purple: '#795cb5',
  amber: '#a97729',
  paleBlue: '#edf4fc',
  paleGreen: '#eaf5ef',
  palePurple: '#f3effb',
  paleAmber: '#fff7e7',
};

let c: CanvasRenderingContext2D,
  spots: Hotspot[] = [];

function box(
  x: number,
  y: number,
  w: number,
  h: number,
  fill = C.white,
  stroke: string | null = C.line,
  r = 17,
) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = 1.7;
    c.stroke();
  }
}

const measure: MeasureText = (value, size, bold) => {
  c.font = `${bold ? 600 : 400} ${size}px Arial`;
  return c.measureText(value).width;
};

function text(
  s: string | number,
  x: number,
  y: number,
  size = 22,
  color = C.ink,
  bold = false,
  maxWidth = Infinity,
) {
  const width = measure(String(s), size, bold);
  if (width > maxWidth) size *= maxWidth / width;
  c.font = `${bold ? '600' : '400'} ${size}px Arial`;
  c.fillStyle = color;
  c.fillText(String(s), x, y);
}

function wrap(
  s: string,
  x: number,
  y: number,
  w: number,
  size = 21,
  color = C.muted,
  lh = 29,
  max = 99,
) {
  const layout = layoutText(s, w, max * lh, size, { leading: lh / size, measure });
  layout.lines.forEach((line, index) =>
    text(line, x, y + index * layout.lineHeight, layout.fontSize, color),
  );
  return y + Math.max(0, layout.lines.length - 1) * layout.lineHeight;
}

function chip(s: string, x: number, y: number, fill = C.paleBlue, color = C.blue) {
  c.font = '500 17px Arial';
  const w = c.measureText(s).width + 26;
  box(x, y, w, 31, fill, null, 13);
  text(s, x + 13, y + 21, 17, color);
  return w;
}

function circle(x: number, y: number, r: number, fill: string, alpha = 1) {
  c.save();
  c.globalAlpha *= alpha;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
  c.restore();
}

function arrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t: number,
  color = C.blue,
  active = true,
) {
  c.strokeStyle = active ? '#acc6de' : C.line;
  c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1);
  c.beginPath();
  c.moveTo(x2 - 11 * Math.cos(a - 0.4), y2 - 11 * Math.sin(a - 0.4));
  c.lineTo(x2, y2);
  c.lineTo(x2 - 11 * Math.cos(a + 0.4), y2 - 11 * Math.sin(a + 0.4));
  c.strokeStyle = active ? color : C.line;
  c.stroke();
  if (active)
    for (const off of [0, 0.5]) {
      const p = (t * 0.16 + off) % 1;
      circle(x1 + (x2 - x1) * p, y1 + (y2 - y1) * p, 10, color, 0.09);
      circle(x1 + (x2 - x1) * p, y1 + (y2 - y1) * p, 4.5, color);
    }
}

function travel(
  label: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  p: number,
  color = C.blue,
) {
  if (p <= 0 || p >= 1) return;
  const q = flowEase(p),
    x = x1 + (x2 - x1) * q,
    y = y1 + (y2 - y1) * q;
  c.save();
  c.globalAlpha *= Math.min(1, p * 7, (1 - p) * 7);
  const width = Math.min(260, Math.max(150, measure(label, 17, true) + 36));
  box(x - width / 2, y - 23, width, 46, C.white, color, 11);
  text(label, x - width / 2 + 18, y + 6, 17, color, true, width - 36);
  c.restore();
}

function title(
  s: string,
  x: number,
  y: number,
  w: number,
  h: number,
  sub: string,
  fill = C.white,
  color = C.blue,
) {
  box(x, y, w, h, fill);
  box(x, y + 23, 4, h - 46, color, null, 2);
  text(s, x + 24, y + 43, 24, C.ink, true, w - 48);
  if (sub)
    wrap(sub, x + 24, y + 77, w - 48, 18, C.muted, 24, Math.max(1, Math.floor((h - 77) / 24)));
}

function page(x: number, y: number, w: number, h: number, label: string) {
  box(x, y, w, h, C.white);
  chip('PDF', x + 22, y + 22);
  wrap(label, x + 22, y + 100, w - 44, 20, C.ink, 26, 2);
  for (let i = 0; i < 4; i++) {
    c.fillStyle = i === 0 ? '#b3c9de' : '#dce6ed';
    c.fillRect(x + 24, y + 145 + i * 23, w - 48 - (i === 3 ? 40 : 0), 5);
  }
}

function db(x: number, y: number, w: number, h: number, sub = 'Vector Search collection') {
  box(x, y + 22, w, h - 44, C.paleGreen, '#bad8cb', 9);
  c.fillStyle = '#e1f0e8';
  c.strokeStyle = '#bad8cb';
  c.lineWidth = 1.7;
  c.beginPath();
  c.ellipse(x + w / 2, y + 25, w / 2, 25, 0, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.beginPath();
  c.ellipse(x + w / 2, y + h - 23, w / 2, 23, 0, 0, Math.PI);
  c.stroke();
  text('MongoDB', x + 31, y + 90, 32, C.green, true);
  text(sub, x + 31, y + 126, 20, C.muted);
}

function chunk(
  o: FlowOptions,
  i: number,
  x: number,
  y: number,
  w: number,
  h: number,
  highlight = true,
) {
  box(x, y, w, h, highlight ? C.white : '#f1f4f7', highlight ? C.line : '#e0e7ed');
  chip(
    `C0${i + 1}`,
    x + 19,
    y + 16,
    [C.paleBlue, C.palePurple, C.paleGreen][i],
    [C.blue, C.purple, C.green][i],
  );
  wrap(
    examples[o.example].chunks[i],
    x + 22,
    y + 80,
    w - 44,
    19,
    highlight ? C.ink : '#9baab7',
    26,
    7,
  );
  text(examples[o.example].file, x + 22, y + h - 20, 15, C.muted);
  spots.push({ id: 'chunk-' + i, x, y, w, h });
}

function sceneFiles(t: number, o: FlowOptions) {
  const e = examples[o.example],
    p = flowEase((t - 2) / 6);
  page(130, 270, 340, 330, e.file);
  box(1040, 280, 400, 310, '#fafdff', '#c9dce9');
  c.setLineDash([7, 8]);
  box(1060, 300, 360, 270, '#fafdff', '#c9dce9');
  c.setLineDash([]);
  text('Ingestion service', 1090, 359, 27, C.ink, true);
  wrap('Collect an approved file and retain its source identity.', 1090, 402, 300, 22, C.muted, 30);
  chip(
    t > 8 ? 'File received' : 'Ready to receive',
    1090,
    512,
    t > 8 ? C.paleGreen : C.paleBlue,
    t > 8 ? C.green : C.blue,
  );
  arrow(500, 433, 1005, 433, t);
  travel('Approved PDF', 480, 433, 1045, 433, (t - 2) / 7);
  chip('Source approval', 145, 638, C.paleGreen, C.green);
  chip('Document version: 1', 340, 638);
  if (p === 1) {
    circle(1381, 329, 15, C.paleGreen);
    text('✓', 1373, 336, 22, C.green);
  }
}

function sceneExtract(t: number, o: FlowOptions) {
  const e = examples[o.example];
  page(110, 285, 270, 315, e.file);
  title(
    'Text extraction',
    570,
    355,
    310,
    160,
    'Read the content and preserve the source.',
    C.paleBlue,
  );
  arrow(405, 435, 550, 435, t);
  arrow(902, 435, 1030, 435, t);
  box(1050, 250, 440, 420);
  chip('Extracted text', 1074, 272);
  const visible = e.body.slice(
    0,
    Math.floor(e.body.length * Math.min(1, Math.max(0, (t - 2) / 8))),
  );
  wrap(visible, 1075, 353, 386, 21, C.ink, 29, 9);
  text('source + version + access metadata', 1075, 640, 16, C.muted);
  travel('Readable text', 880, 435, 1050, 435, ((t - 2) % 5) / 5);
}

function sceneChunks(t: number, o: FlowOptions) {
  const e = examples[o.example],
    p = flowEase((t - 1) / 5);
  box(160, 220, 1280, 140, '#fff');
  chip('Extracted paragraph', 181, 237);
  wrap(e.body, 181, 298, 1235, 18, C.muted, 24, 2);
  const targets = [65, 585, 1105];
  for (let i = 0; i < 3; i++) {
    const x = 585 + (targets[i] - 585) * p,
      y = 310 + 78 * p;
    c.save();
    c.globalAlpha = 0.18 + 0.82 * p;
    chunk(o, i, x, y, 430, 286);
    c.restore();
    arrow(x + 215, 365, x + 215, 380, t, [C.blue, C.purple, C.green][i], p > 0.6);
  }
  chip('Shared context repeats across adjacent chunks', 465, 697, C.paleAmber, C.amber);
}

function sceneEmbeddings(t: number, o: FlowOptions) {
  for (let i = 0; i < 3; i++) {
    const y = 250 + i * 137;
    box(90, y, 490, 112);
    chip(`C0${i + 1}`, 109, y + 15);
    wrap(examples[o.example].chunks[i], 190, y + 42, 365, 18, C.muted, 25, 2);
    box(1090, y, 425, 112, C.palePurple);
    text(`C0${i + 1}  →  embedding`, 1113, y + 37, 20, C.purple, true);
    text(vectors[i], 1113, y + 79, 22, C.purple);
  }
  title(
    'Embedding model',
    690,
    365,
    290,
    150,
    'Represent passage meaning.',
    C.palePurple,
    C.purple,
  );
  arrow(600, 440, 668, 440, t, C.purple);
  arrow(998, 440, 1070, 440, t, C.purple);
  for (let i = 0; i < 3; i++)
    travel(
      'C0' + (i + 1),
      540,
      306 + i * 137,
      1120,
      306 + i * 137,
      ((t + i * 1.2) % 6) / 6,
      C.purple,
    );
  chip('3 chunks → 3 vectors', 717, 573, C.palePurple, C.purple);
}

function sceneStore(t: number, o: FlowOptions) {
  const e = examples[o.example],
    count = Math.min(3, Math.max(0, Math.floor((t - 2) / 2.4)));
  box(95, 242, 665, 431);
  chip('Example record · C02', 119, 262, C.palePurple, C.purple);
  const rows = [
    ['text', e.chunks[1].slice(0, 70) + '…'],
    ['embedding', vectors[1]],
    ['source', e.file],
    ['version', '1'],
    ['access_scope', 'employee-support'],
  ];
  rows.forEach(([k, v], i) => {
    text(k, 122, 348 + i * 58, 19, C.muted);
    wrap(v, 290, 348 + i * 58, 440, 19, k === 'embedding' ? C.purple : C.ink, 24, 1);
  });
  db(1060, 290, 420, 318);
  for (let i = 0; i < count; i++) chip('C0' + (i + 1), 1089 + i * 115, 475, C.white, C.green);
  arrow(790, 441, 1030, 441, t, C.green);
  for (let i = 0; i < 3; i++)
    travel(
      'C0' + (i + 1) + ' + vector',
      760,
      360 + i * 59,
      1090,
      440,
      (t - 2 - i * 2.4) / 2.4,
      C.green,
    );
  chip(
    count === 3 ? '✓ 3 searchable records ready' : `${count} / 3 records stored`,
    1084,
    649,
    C.paleGreen,
    C.green,
  );
}

function sceneTyping(t: number, o: FlowOptions) {
  const p = Math.min(1, Math.max(0, t / 6)),
    typed = o.prompt.slice(0, Math.floor(o.prompt.length * p));
  box(95, 245, 900, 430);
  text('Employee', 126, 293, 22, C.muted);
  circle(949, 285, 7, C.green);
  text('Chat', 126, 336, 28, C.ink, true);
  if (t > 7) {
    box(330, 365, 620, 137, C.paleBlue, null);
    wrap(o.prompt, 355, 407, 568, 23, C.ink, 31, 3);
  }
  box(125, 536, 840, 106, '#fbfdff');
  wrap(
    t > 7 ? 'Question sent' : typed + (Math.floor(t * 2) % 2 === 0 ? '│' : ''),
    150,
    577,
    710,
    22,
    t > 7 ? C.muted : C.ink,
    29,
    2,
  );
  circle(918, 589, 24, t > 6 ? C.blue : '#d8e4ef');
  text('↑', 908, 598, 29, C.white);
  title('Chat endpoint', 1190, 375, 330, 154, 'Authenticated REST API', C.paleBlue);
  arrow(1015, 448, 1167, 448, t);
  travel('Employee question', 960, 445, 1190, 445, (t - 7) / 5);
}

function sceneIntake(t: number, o: FlowOptions) {
  title('Request received', 80, 255, 475, 395, '', C.white);
  const tags = [
    'Employee identity verified',
    'Roles checked',
    'Answer cache: miss',
    'Conversation scope retained',
  ];
  tags.forEach((s, i) => {
    circle(115, 365 + i * 62, 13, i === 2 ? C.paleAmber : C.paleGreen);
    text(i === 2 ? '→' : '✓', 108, 372 + i * 62, 18, i === 2 ? C.amber : C.green);
    text(s, 143, 372 + i * 62, 21, C.ink);
  });
  title(
    'Spring AI',
    690,
    350,
    320,
    178,
    'Represent the question for retrieval.',
    C.paleAmber,
    C.amber,
  );
  arrow(575, 442, 668, 442, t);
  arrow(1030, 442, 1115, 442, t, C.purple);
  box(1138, 288, 390, 305, C.palePurple);
  text('Question embedding', 1162, 337, 25, C.ink, true);
  wrap(o.prompt, 1162, 386, 338, 20, C.muted, 29, 3);
  text('[0.18, 0.41, −0.09, …]', 1162, 520, 23, C.purple);
  chip('Compatible document + query embedding model', 555, 691, C.palePurple, C.purple);
}

function sceneRetrieve(t: number, o: FlowOptions) {
  const match = hasEvidence(o);
  title(
    'Question vector',
    75,
    360,
    320,
    180,
    'Search by meaning, within the employee’s access scope.',
    C.palePurple,
    C.purple,
  );
  db(525, 310, 380, 290);
  arrow(417, 448, 500, 448, t, C.green);
  arrow(925, 448, 1067, 448, t, C.green);
  if (match) {
    for (let i = 0; i < 3; i++) {
      const y = 225 + i * 154;
      box(1090, y, 445, 134, i ? C.white : '#f0f4f7', i ? '#bdd8cb' : '#e1e7ed');
      chip('C0' + (i + 1), 1109, y + 15, i ? C.paleGreen : '#e7edf2', i ? C.green : '#9aa9b6');
      wrap(examples[o.example].chunks[i], 1192, y + 40, 317, 18, i ? C.ink : '#9aa9b6', 25, 3);
    }
    chip('Selected: C02 + C03', 1132, 699, C.paleGreen, C.green);
    travel('Selected evidence', 908, 447, 1090, 447, ((t - 3) % 5) / 5, C.green);
  } else {
    box(1090, 320, 445, 265);
    text('No matching evidence', 1116, 374, 26, C.ink, true);
    wrap(
      'The selected example collection does not cover this question. Return a clear limit and a Service Desk handoff.',
      1116,
      420,
      391,
      22,
      C.muted,
      31,
    );
    chip('0 passages selected', 1140, 634, C.paleAmber, C.amber);
  }
}

function sceneAssemble(t: number, o: FlowOptions) {
  if (!hasEvidence(o)) {
    noEvidence();
    return;
  }
  box(115, 224, 1370, 478);
  chip('Focused model input', 141, 245, C.paleAmber, C.amber);
  box(145, 301, 1310, 79, C.paleBlue, null, 11);
  text('Instructions', 168, 332, 18, C.blue, true);
  text(
    'Answer from permitted evidence. Cite the source. Escalate if unsupported.',
    340,
    347,
    22,
    C.ink,
  );
  box(145, 397, 1310, 88, '#f6f8fb', null, 11);
  text('Question', 168, 433, 18, C.blue, true);
  wrap(o.prompt, 340, 433, 1080, 22, C.ink, 29, 2);
  for (let i = 0; i < 2; i++) {
    box(145 + i * 665, 503, 645, 168, C.paleGreen, null, 11);
    chip('Evidence · C0' + (i + 2), 163 + i * 665, 517, C.white, C.green);
    wrap(examples[o.example].chunks[i + 1], 163 + i * 665, 582, 606, 19, C.ink, 26, 3);
  }
  const p = flowEase((t - 1) / 4);
  c.strokeStyle = '#b5cee4';
  c.lineWidth = 3;
  c.setLineDash([8, 14]);
  c.lineDashOffset = -p * 80;
  c.strokeRect(109, 218, 1382, 490);
  c.setLineDash([]);
}

function noEvidence() {
  box(260, 285, 1080, 320);
  chip('No relevant source', 291, 316, C.paleAmber, C.amber);
  text('Use the no-evidence response path.', 292, 407, 35, C.ink, true);
  wrap(
    'Do not fabricate a troubleshooting answer. Explain the limit and refer the employee to Service Desk.',
    292,
    465,
    1000,
    25,
    C.muted,
    34,
  );
  chip('Chat generation skipped in this example', 530, 643, C.paleGreen, C.green);
}

function sceneGenerate(t: number, o: FlowOptions) {
  if (!hasEvidence(o)) {
    noEvidence();
    return;
  }
  title('Focused input', 75, 310, 405, 270, '', C.white);
  ['Instructions', 'Employee question', 'Evidence: C02 + C03'].forEach((s, i) =>
    chip(s, 101, 398 + i * 48, i === 2 ? C.paleGreen : C.paleBlue, i === 2 ? C.green : C.blue),
  );
  title(
    'Azure OpenAI',
    625,
    350,
    345,
    190,
    'Chat model generates from selected evidence.',
    C.palePurple,
    C.purple,
  );
  arrow(500, 440, 602, 440, t, C.purple);
  arrow(992, 440, 1093, 440, t, C.purple);
  box(1115, 255, 420, 397);
  chip(t > 11 ? 'Response prepared' : 'Generating response', 1138, 277, C.palePurple, C.purple);
  const answer = flowAnswer(o),
    n = Math.floor(answer.length * Math.min(1, Math.max(0, (t - 2) / 9)));
  wrap(answer.slice(0, n) + (n < answer.length ? '│' : ''), 1140, 361, 367, 22, C.ink, 30, 9);
  travel('Context', 475, 440, 635, 440, ((t - 1) % 5) / 5, C.purple);
  text('Separate from the embedding model call', 607, 642, 18, C.muted);
}

function sceneReturn(t: number, o: FlowOptions) {
  const e = examples[o.example],
    match = hasEvidence(o);
  box(120, 225, 1360, 472);
  text('Service Desk', 154, 275, 24, C.ink, true);
  chip('Employee chat', 1257, 248);
  box(600, 302, 830, 90, C.paleBlue, null, 13);
  wrap(o.prompt, 626, 340, 776, 22, C.ink, 29, 2);
  box(163, 415, 1232, 209, match ? C.paleGreen : C.paleAmber, null, 13);
  wrap(flowAnswer(o), 189, 461, 1178, 25, C.ink, 34, 4);
  if (match) {
    chip('[1] ' + e.file + ' · C02', 190, 562, C.white, C.green);
    chip('[2] ' + e.file + ' · C03', 740, 562, C.white, C.green);
    text('Traceable source references', 189, 661, 19, C.muted);
    spots.push(
      { id: 'chunk-1', x: 189, y: 560, w: 510, h: 35 },
      { id: 'chunk-2', x: 739, y: 560, w: 510, h: 35 },
    );
  } else text('No invented answer · refer to Service Desk', 189, 661, 19, C.amber);
}

const renderers = [
  sceneFiles,
  sceneExtract,
  sceneChunks,
  sceneEmbeddings,
  sceneStore,
  sceneTyping,
  sceneIntake,
  sceneRetrieve,
  sceneAssemble,
  sceneGenerate,
  sceneReturn,
];

export function drawFlow(ctx: CanvasRenderingContext2D, time: number, o: FlowOptions): Hotspot[] {
  c = ctx;
  spots = [];
  const i = flowIndex(time),
    local = time - i * 14,
    scene = flowScenes[i],
    isFiles = i < 5,
    phase = isFiles ? i : i - 5,
    count = isFiles ? 5 : 6;
  const t = o.reduced ? 11 : local;
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, 1600, 900);
  c.fillStyle = C.paper;
  c.fillRect(0, 0, 1600, 900);
  for (let y = 20; y < 740; y += 25)
    for (let x = 20; x < 1600; x += 25) circle(x, y, 0.65, '#d5e0e9', 0.55);
  text(
    isFiles ? 'Prepare company knowledge' : 'Follow the employee’s question',
    66,
    66,
    22,
    C.muted,
  );
  const gap = 18,
    w = (1468 - gap * (count - 1)) / count;
  for (let k = 0; k < count; k++) {
    const x = 66 + k * (w + gap),
      step = flowScenes[(isFiles ? 0 : 5) + k],
      active = k === phase,
      done = k < phase;
    box(
      x,
      108,
      w,
      66,
      active ? C.white : done ? C.paleGreen : '#f0f4f8',
      active ? '#9cbcd7' : null,
      13,
    );
    text(
      (done ? '✓ ' : String(k + 1) + '  ') + step.short,
      x + 15,
      148,
      18,
      active ? C.blue : done ? C.green : '#97a8b7',
      active,
      w - 30,
    );
    spots.push({ id: 'scene-' + ((isFiles ? 0 : 5) + k), x, y: 108, w, h: 66, fixed: true });
    if (k < count - 1) arrow(x + w + 2, 141, x + w + gap - 2, 141, t, C.blue, k < phase);
  }
  const zoom = 1 + 0.018 * flowEase(t / 13);
  c.save();
  c.beginPath();
  c.rect(0, 202, 1600, 536);
  c.clip();
  c.translate(800, 462);
  c.scale(zoom, zoom);
  c.translate(-800, -462);
  renderers[i](t, o);
  c.restore();
  let titleText = scene.title,
    copy = scene.copy;
  if (!hasEvidence(o) && i >= 8) {
    titleText =
      i === 10
        ? 'Explain the limit and hand off to Service Desk.'
        : 'No matching evidence: take the fallback path.';
    copy =
      'This example collection does not cover the question. The demonstration skips chat generation and returns a clear support handoff.';
  }
  c.fillStyle = C.paper;
  c.fillRect(0, 758, 1600, 142);
  c.strokeStyle = '#e4ebf1';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(66, 767);
  c.lineTo(1534, 767);
  c.stroke();
  text(titleText, 66, 810, 28, C.ink, false, 1300);
  wrap(copy, 66, 851, 1440, 20, C.muted, 27, 2);
  c.textAlign = 'right';
  text(`${isFiles ? 'Files' : 'Prompt'} ${phase + 1} / ${count}`, 1534, 810, 19, '#92a4b4');
  c.textAlign = 'left';
  c.restore();
  return spots.map((s) =>
    s.fixed
      ? s
      : {
          ...s,
          x: 800 + (s.x - 800) * zoom,
          y: 462 + (s.y - 462) * zoom,
          w: s.w * zoom,
          h: s.h * zoom,
        },
  );
}
