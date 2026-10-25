const {
  boxes,
  edges,
  steps,
  stepAt,
  tourCamera,
  smooth,
  layoutNodeText,
  layoutText,
} = require('../../.work/video-frame.cjs');

const ink = '#26384c',
  muted = '#6b7b8c',
  paper = '#f7fafc';

const colors = {
    blue: '#386cba',
    green: '#247a68',
    amber: '#a87322',
    purple: '#7658bb',
    plain: '#6d7b89',
  },
  fills = {
    blue: '#eef5ff',
    green: '#edf8f3',
    amber: '#fff7e7',
    purple: '#f4f0fc',
    plain: '#fbfcfd',
  };

function rounded(c, x, y, w, h, fill, stroke, r = 17, line = 2) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = line;
    c.stroke();
  }
}

function text(c, s, x, y, size = 22, color = muted, bold = false) {
  c.font = `${bold ? '600' : '400'} ${size}px Arial`;
  c.fillStyle = color;
  c.fillText(s, x, y);
}

function group(c, x, y, w, h, label, fill = '#f8fafb') {
  rounded(c, x, y, w, h, fill, '#dce4ea', 27);
  text(c, label, x + 28, y + 42, 25, '#647486');
}

function pointAt(e, t) {
  const lengths = e.points
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - e.points[i][0], p[1] - e.points[i][1]));
  let pos = t * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (pos <= lengths[i]) {
      const a = pos / lengths[i];
      return [
        e.points[i][0] + (e.points[i + 1][0] - e.points[i][0]) * a,
        e.points[i][1] + (e.points[i + 1][1] - e.points[i][1]) * a,
      ];
    }
    pos -= lengths[i];
  }
  return e.points.at(-1);
}

function circle(c, x, y, r, fill, opacity = 1) {
  c.save();
  c.globalAlpha = opacity;
  c.fillStyle = fill;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

function connection(c, e, active, t, i) {
  c.save();
  c.globalAlpha = e.future && !active ? 0.45 : 1;
  c.beginPath();
  c.moveTo(...e.points[0]);
  for (const p of e.points.slice(1)) c.lineTo(...p);
  c.strokeStyle = active ? '#b5cde3' : '#b8c5d1';
  c.lineWidth = active ? 4 : 2;
  c.lineJoin = 'round';
  c.setLineDash(e.future ? [8, 9] : []);
  c.stroke();
  if (active) {
    c.strokeStyle = '#527da8';
    c.lineWidth = 2;
    c.setLineDash([8, 17]);
    c.lineDashOffset = -t * 20;
    c.stroke();
  }
  c.setLineDash([]);
  c.lineDashOffset = 0;
  const end = e.points.at(-1),
    prev = e.points.at(-2),
    a = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
  c.beginPath();
  c.moveTo(end[0] - 12 * Math.cos(a - 0.4), end[1] - 12 * Math.sin(a - 0.4));
  c.lineTo(...end);
  c.lineTo(end[0] - 12 * Math.cos(a + 0.4), end[1] - 12 * Math.sin(a + 0.4));
  c.strokeStyle = active ? '#527da8' : '#aebdcb';
  c.lineWidth = 2;
  c.stroke();
  if (e.label) {
    c.font = '400 21px Arial';
    c.lineWidth = 10;
    c.strokeStyle = paper;
    c.strokeText(e.label, e.lx, e.ly);
    text(c, e.label, e.lx, e.ly, 21, active ? '#416c94' : '#8b9aa9');
  }
  if (active)
    for (const offset of [0, 0.5]) {
      const p = pointAt(e, (t * 0.2 + offset + i * 0.13) % 1);
      circle(c, p[0], p[1], 12, '#4c87b8', 0.12);
      circle(c, p[0], p[1], 5.5, '#3d77b3');
    }
  c.restore();
}

function node(c, b, active) {
  const k = b.kind || 'plain',
    color = colors[k];
  if (active) {
    c.save();
    c.globalAlpha = 0.09;
    rounded(c, b.x - 7, b.y - 7, b.w + 14, b.h + 14, color, null, 24);
    c.restore();
  }
  c.setLineDash(b.future && !active ? [7, 7] : []);
  rounded(
    c,
    b.x,
    b.y,
    b.w,
    b.h,
    active ? fills[k] : '#fff',
    active ? color : '#cfd9e2',
    17,
    active ? 3 : 2,
  );
  c.setLineDash([]);
  c.save();
  c.globalAlpha = active ? 1 : 0.35;
  rounded(c, b.x, b.y + 22, 5, b.h - 44, color, null, 2);
  c.restore();
  const layout = layoutNodeText(b, (value, size, bold) => {
    c.font = `${bold ? 600 : 400} ${size}px Arial`;
    return c.measureText(value).width;
  });
  layout.title.lines.forEach((line, i) =>
    text(
      c,
      line,
      b.x + layout.padding,
      b.y + layout.padding + layout.title.fontSize + i * layout.title.lineHeight,
      layout.title.fontSize,
      ink,
      true,
    ),
  );
  layout.subtitle.lines.forEach((line, i) =>
    text(
      c,
      line,
      b.x + layout.padding,
      b.y + layout.subtitleTop + layout.subtitle.fontSize + i * layout.subtitle.lineHeight,
      layout.subtitle.fontSize,
    ),
  );
}

function tokens(c, local, t) {
  const p = smooth((local - 3) / 6),
    total = 50000,
    selected = 2000,
    shown = Math.round(total + (selected - total) * p),
    percent = Math.round(96 * p);
  c.save();
  c.globalAlpha = 0.94;
  c.fillStyle = paper;
  c.fillRect(0, 0, 1600, 755);
  c.restore();
  rounded(c, 135, 145, 1330, 500, '#fff', '#d7e2eb', 25);
  text(c, 'Document context sent to the model', 181, 212, 29, '#31465b');
  text(c, percent + '%', 182, 334, 86, '#286c65', true);
  text(c, 'less document context', 187, 375, 23, '#52697d');
  text(c, 'Entire collection', 615, 277, 23, '#586e82');
  c.textAlign = 'right';
  text(c, '50,000 tokens', 1410, 277, 23, '#586e82');
  c.textAlign = 'left';
  rounded(c, 615, 300, 795, 58, '#e7edf5', null, 9);
  for (let i = 0; i < 40; i++) rounded(c, 620 + i * 19.7, 306, 14, 46, '#bacbe0', null, 2);
  text(c, 'Retrieved passages', 615, 411, 23, '#286c65');
  c.textAlign = 'right';
  text(c, shown.toLocaleString('en-US') + ' tokens', 1410, 411, 23, '#286c65');
  c.textAlign = 'left';
  rounded(c, 615, 435, 795, 58, '#e7f3ed', null, 9);
  rounded(c, 615, 435, Math.max(24, (795 * shown) / total), 58, '#337d70', null, 9);
  text(c, '100 passages × 500 tokens → 4 selected passages × 500 tokens', 181, 564, 23, '#5c7286');
  text(
    c,
    'This percentage applies to document context, not total request tokens or total cost.',
    181,
    607,
    20,
    '#8192a2',
  );
  circle(c, 540 + Math.sin(t) * 5, 381, 18, '#eef3f8');
  text(c, '→', 529, 389, 25, '#6583a0');
}

function draw(c, t) {
  const index = stepAt(t),
    local = t - index * 18,
    step = steps[index],
    cam = tourCamera(t),
    scale = 1600 / cam.width;
  c.save();
  c.scale(0.8, 0.8);
  c.fillStyle = paper;
  c.fillRect(0, 0, 1600, 900);
  c.save();
  c.beginPath();
  c.rect(0, 0, 1600, 760);
  c.clip();
  for (let y = 1; y < 760; y += 23)
    for (let x = 1; x < 1600; x += 23) circle(c, x, y, 0.8, '#cfdce6');
  c.translate(800, 380);
  c.scale(scale, scale);
  c.translate(-cam.x, -cam.y);
  group(c, 65, 155, 705, 975, 'Reusable components');
  group(c, 95, 230, 645, 290, 'Azure Artifacts', '#f0f5fc');
  group(c, 95, 640, 645, 400, 'Consuming web application', '#f3f8f6');
  group(c, 905, 425, 1285, 490, 'Spring Boot starter · shipped', '#fdfaf2');
  group(c, 905, 995, 1985, 460, 'Wired by the application developer', '#f0f7f4');
  text(c, 'Chat experience', 1000, 128, 24, '#718499');
  text(c, 'Specialist Spring AI applications', 1565, 128, 24, '#718499');
  text(c, 'Document preparation · on knowledge updates', 2140, 1475, 22, '#718499');
  edges.forEach((e, i) => connection(c, e, step.flows.includes(e.id), t, i));
  boxes.forEach((b) => node(c, b, step.nodes.includes(b.id)));
  if (index === 4) {
    rounded(c, 994, 350, 630, 70, '#fff', '#c5d7e7', 18);
    text(c, '“I cannot connect using Check Point VPN.”', 1020, 395, 25, '#3c6085');
  }
  if (index === 7) {
    rounded(c, 1395, 755, 330, 100, '#e5f4ec', '#b9d8c8', 18);
    text(c, 'Eligible answer reused', 1423, 795, 22, '#286c55', true);
    text(c, '0 generation calls', 1423, 829, 22, '#5c816e');
  }
  c.restore();
  if (index === 8) tokens(c, local, t);
  const gradient = c.createLinearGradient(0, 738, 0, 900);
  gradient.addColorStop(0, '#f7fafc00');
  gradient.addColorStop(0.2, paper);
  gradient.addColorStop(1, paper);
  c.fillStyle = gradient;
  c.fillRect(0, 738, 1600, 162);
  const measure = (value, size, bold) => {
    c.font = `${bold ? 600 : 400} ${size}px Arial`;
    return c.measureText(value).width;
  };
  const title = layoutText(step.title, 1300, 42, 28, { minSize: 24, measure });
  const copy = layoutText(step.copy, 1470, 60, 20, { minSize: 18, measure });
  text(c, title.lines[0], 65, 797, title.fontSize, '#233d54');
  copy.lines.forEach((line, i) =>
    text(c, line, 65, 837 + i * copy.lineHeight, copy.fontSize, '#708397'),
  );
  c.textAlign = 'right';
  text(c, String(index + 1).padStart(2, '0') + ' / 10', 1535, 797, 20, '#8da0b0');
  c.textAlign = 'left';
  c.restore();
}

module.exports = { draw };
