import React from 'react';
import {
  layoutText,
  measureText as defaultMeasureText,
  type MeasureText,
} from '../../shared/text-layout';
import { layoutNodeText } from './text-layout';
import {
  boxes,
  edges,
  steps,
  stepAt,
  tourCamera,
  type Camera,
  type Box,
  type Edge,
  smooth,
} from './model';

const colors = {
  blue: '#386cba',
  green: '#247a68',
  amber: '#a87322',
  purple: '#7658bb',
  plain: '#6d7b89',
};

const fills = {
  blue: '#eef5ff',
  green: '#edf8f3',
  amber: '#fff7e7',
  purple: '#f4f0fc',
  plain: '#fbfcfd',
};

function pointAt(e: Edge, t: number) {
  const lengths = e.points
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - e.points[i][0], p[1] - e.points[i][1]));
  let target = t * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (target <= lengths[i]) {
      const p = target / lengths[i];
      return [
        e.points[i][0] + (e.points[i + 1][0] - e.points[i][0]) * p,
        e.points[i][1] + (e.points[i + 1][1] - e.points[i][1]) * p,
      ];
    }
    target -= lengths[i];
  }
  return e.points.at(-1)!;
}

const Group = ({
  x,
  y,
  w,
  h,
  label,
  tint = '#f8fafb',
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  tint?: string;
}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="27" fill={tint} stroke="#dce4ea" strokeWidth="2" />
    <text x={x + 28} y={y + 42} fill="#647486" fontSize="25" fontWeight="500">
      {label}
    </text>
  </g>
);

const Node = React.memo(function Node({
  box,
  active,
  selected,
  measure,
}: {
  box: Box;
  active: boolean;
  selected: boolean;
  measure: MeasureText;
}) {
  const k = box.kind ?? 'plain',
    c = colors[k],
    layout = layoutNodeText(box, measure);
  return (
    <g
      data-node={box.id}
      className="diagram-node"
      role="button"
      aria-label={box.title}
      tabIndex={0}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x={box.x - 7}
        y={box.y - 7}
        width={box.w + 14}
        height={box.h + 14}
        rx="24"
        fill={active || selected ? c : 'transparent'}
        opacity=".09"
      />
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx="17"
        fill={active ? fills[k] : '#fff'}
        stroke={active || selected ? c : '#cfd9e2'}
        strokeWidth={active || selected ? 3 : 2}
        strokeDasharray={box.future && !active ? '7 7' : undefined}
      />
      <rect
        x={box.x}
        y={box.y + 22}
        width="5"
        height={box.h - 44}
        rx="2"
        fill={c}
        opacity={active ? 1 : 0.35}
      />
      <text fontSize={layout.title.fontSize} fontWeight="600" fill="#26384c">
        {layout.title.lines.map((line, i) => (
          <tspan
            key={i}
            x={box.x + layout.padding}
            y={box.y + layout.padding + layout.title.fontSize + i * layout.title.lineHeight}
          >
            {line}
          </tspan>
        ))}
      </text>
      <text fontSize={layout.subtitle.fontSize} fill="#6b7b8c">
        {layout.subtitle.lines.map((l, i) => (
          <tspan
            key={i}
            x={box.x + layout.padding}
            y={
              box.y + layout.subtitleTop + layout.subtitle.fontSize + i * layout.subtitle.lineHeight
            }
          >
            {l}
          </tspan>
        ))}
      </text>
    </g>
  );
});

function Connection({
  edge,
  active,
  time,
  flowIndex,
}: {
  edge: Edge;
  active: boolean;
  time: number;
  flowIndex: number;
}) {
  const c = active ? '#527da8' : '#b8c5d1';
  const particles = active
    ? [0, 0.5].map((offset, i) => {
        const pos = pointAt(edge, (time * 0.2 + offset + flowIndex * 0.13) % 1);
        return (
          <g key={i}>
            <circle cx={pos[0]} cy={pos[1]} r="12" fill="#4c87b8" opacity=".12" />
            <circle cx={pos[0]} cy={pos[1]} r="5.5" fill="#3d77b3" />
          </g>
        );
      })
    : null;
  return (
    <g pointerEvents="none" opacity={edge.future && !active ? 0.45 : 1}>
      <path
        d={edge.d}
        fill="none"
        stroke={active ? '#b5cde3' : c}
        strokeWidth={active ? 4 : 2}
        strokeDasharray={edge.future ? '8 9' : undefined}
        strokeLinejoin="round"
        markerEnd={`url(#${active ? 'activeArrow' : 'arrow'})`}
      />
      {active && (
        <path
          d={edge.d}
          fill="none"
          stroke="#527da8"
          strokeWidth="2"
          strokeDasharray="8 17"
          strokeDashoffset={-time * 20}
        />
      )}{' '}
      {edge.label && (
        <text
          x={edge.lx}
          y={edge.ly}
          fontSize="21"
          fill={active ? '#416c94' : '#8b9aa9'}
          paintOrder="stroke"
          stroke="#f7fafc"
          strokeWidth="10"
          strokeLinejoin="round"
        >
          {edge.label}
        </text>
      )}
      {particles}
    </g>
  );
}

function TokenCutaway({
  local,
  time,
  corpus,
  topK,
  playing,
}: {
  local: number;
  time: number;
  corpus: number;
  topK: number;
  playing: boolean;
}) {
  const p = playing ? smooth((local - 3) / 6) : 1,
    total = corpus * 500,
    selected = topK * 500,
    shown = Math.round(total + (selected - total) * p),
    percent = Math.round((1 - topK / corpus) * 100 * p);
  return (
    <g>
      <rect width="1600" height="755" fill="#f7fafc" opacity=".94" />
      <rect x="135" y="145" width="1330" height="500" rx="25" fill="#fff" stroke="#d7e2eb" />
      <text x="181" y="212" fontSize="29" fill="#31465b">
        Document context sent to the model
      </text>
      <text x="182" y="334" fontSize="86" fontWeight="600" fill="#286c65">
        {percent}%
      </text>
      <text x="187" y="375" fontSize="23" fill="#52697d">
        less document context
      </text>
      <text x="615" y="277" fontSize="23" fill="#586e82">
        Entire collection
      </text>
      <text x="1410" y="277" fontSize="23" fill="#586e82" textAnchor="end">
        {total.toLocaleString()} tokens
      </text>
      <rect x="615" y="300" width="795" height="58" rx="9" fill="#e7edf5" />
      {Array.from({ length: 40 }, (_, i) => (
        <rect key={i} x={620 + i * 19.7} y="306" width="14" height="46" rx="2" fill="#bacbe0" />
      ))}
      <text x="615" y="411" fontSize="23" fill="#286c65">
        Retrieved passages
      </text>
      <text x="1410" y="411" fontSize="23" fill="#286c65" textAnchor="end">
        {shown.toLocaleString()} tokens
      </text>
      <rect x="615" y="435" width="795" height="58" rx="9" fill="#e7f3ed" />
      <rect
        x="615"
        y="435"
        width={Math.max(24, (795 * shown) / total)}
        height="58"
        rx="9"
        fill="#337d70"
      />
      <text x="181" y="564" fontSize="23" fill="#5c7286">
        {corpus} passages × 500 tokens → {topK} selected passages × 500 tokens
      </text>
      <text x="181" y="607" fontSize="20" fill="#8192a2">
        This percentage applies to document context, not total request tokens or total cost.
      </text>
      <circle cx={540 + Math.sin(time) * 5} cy="381" r="18" fill="#eef3f8" />
      <path
        d="M531 381 H551 M543 374 L551 381 L543 388"
        fill="none"
        stroke="#6583a0"
        strokeWidth="2"
      />
    </g>
  );
}

export type DiagramProps = {
  time: number;
  camera?: Camera;
  selected?: string;
  cacheFresh?: boolean;
  corpus?: number;
  topK?: number;
  playing?: boolean;
  reducedMotion?: boolean;
  measureText?: MeasureText;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
  onKeyDown?: React.KeyboardEventHandler<SVGSVGElement>;
  onPointerDown?: React.PointerEventHandler<SVGSVGElement>;
  onPointerMove?: React.PointerEventHandler<SVGSVGElement>;
  onPointerUp?: React.PointerEventHandler<SVGSVGElement>;
};

export function Diagram({
  time,
  camera,
  selected,
  cacheFresh = false,
  corpus = 100,
  topK = 4,
  playing = true,
  reducedMotion = false,
  measureText = defaultMeasureText,
  ...handlers
}: DiagramProps) {
  const index = stepAt(time),
    local = time - index * 18,
    step = steps[index],
    cam = camera ?? tourCamera(time);
  let activeNodes = [...step.nodes],
    flows = [...step.flows];
  if (index === 7 && cacheFresh) {
    activeNodes = ['endpoint', 'cache', 'spring', 'retriever', 'mongo', 'azure'];
    flows = ['endpoint-spring', 'spring-retriever', 'retriever-mongo', 'spring-azure'];
  }
  const activeFlowIndex = Math.min(
    flows.length - 1,
    Math.floor(Math.max(0, local - 2) / Math.max(3, 12 / flows.length)),
  );
  const scale = 1600 / cam.width,
    transform = `translate(800 380) scale(${scale}) translate(${-cam.x} ${-cam.y})`;
  let title = step.title,
    copy = step.copy;
  if (index === 8)
    copy = `${corpus} × 500-token passages become ${topK} retrieved passages. Retrieval keeps the model focused on the relevant evidence.`;
  if (index === 7 && cacheFresh) {
    title = 'The employee requests a fresh answer.';
    copy =
      'Bypass the answer cache and follow retrieval and generation again. The normal eligibility and document-access checks still apply.';
  }
  const captionTitle = layoutText(title, 1300, 42, 28, { minSize: 24, measure: measureText });
  const captionCopy = layoutText(copy, 1470, 60, 20, { minSize: 18, measure: measureText });
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1600 900"
      role="img"
      aria-label={title + ' ' + copy}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        touchAction: 'none',
        fontFamily: 'Arial, sans-serif',
      }}
      {...handlers}
    >
      <defs>
        <pattern id="dots" width="23" height="23" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".8" fill="#cfdce6" />
        </pattern>
        <marker
          id="arrow"
          viewBox="0 0 12 12"
          refX="10"
          refY="6"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M2 2 L10 6 L2 10" fill="none" stroke="#aebdcb" strokeWidth="1.8" />
        </marker>
        <marker
          id="activeArrow"
          viewBox="0 0 12 12"
          refX="10"
          refY="6"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M2 2 L10 6 L2 10" fill="none" stroke="#527da8" strokeWidth="1.8" />
        </marker>
        <clipPath id="mapClip">
          <rect width="1600" height="760" />
        </clipPath>
        <linearGradient id="captionFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7fafc" stopOpacity="0" />
          <stop offset=".2" stopColor="#f7fafc" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="#f7fafc" />
      <rect width="1600" height="760" fill="url(#dots)" />
      <g clipPath="url(#mapClip)">
        <g transform={transform}>
          <Group x={65} y={155} w={705} h={975} label="Reusable components" />
          <Group x={95} y={230} w={645} h={290} label="Azure Artifacts" tint="#f0f5fc" />
          <Group x={95} y={640} w={645} h={400} label="Consuming web application" tint="#f3f8f6" />
          <Group
            x={905}
            y={425}
            w={1285}
            h={490}
            label="Spring Boot starter · shipped"
            tint="#fdfaf2"
          />
          <Group
            x={905}
            y={995}
            w={1985}
            h={460}
            label="Wired by the application developer"
            tint="#f0f7f4"
          />
          <text x="1000" y="128" fontSize="24" fill="#718499">
            Chat experience
          </text>
          <text x="1565" y="128" fontSize="24" fill="#718499">
            Specialist Spring AI applications
          </text>
          <text x="2140" y="1475" fontSize="22" fill="#718499">
            Document preparation · on knowledge updates
          </text>
          {edges.map((e, i) => (
            <Connection
              key={e.id}
              edge={e}
              active={flows.includes(e.id)}
              flowIndex={i}
              time={reducedMotion ? 0 : time}
            />
          ))}
          {boxes.map((b) => (
            <Node
              key={b.id}
              box={b}
              active={activeNodes.includes(b.id)}
              selected={selected === b.id}
              measure={measureText}
            />
          ))}
          {index === 4 && (
            <g>
              <rect
                x="994"
                y="350"
                width="630"
                height="70"
                rx="18"
                fill="#fff"
                stroke="#c5d7e7"
                strokeWidth="2"
              />
              <text x="1020" y="395" fontSize="25" fill="#3c6085">
                “I cannot connect using Check Point VPN.”
              </text>
            </g>
          )}
          {index === 7 && !cacheFresh && (
            <g>
              <rect
                x="1395"
                y="755"
                width="330"
                height="100"
                rx="18"
                fill="#e5f4ec"
                stroke="#b9d8c8"
              />
              <text x="1423" y="795" fontSize="22" fill="#286c55" fontWeight="600">
                Eligible answer reused
              </text>
              <text x="1423" y="829" fontSize="22" fill="#5c816e">
                0 generation calls
              </text>
            </g>
          )}
        </g>
      </g>
      {index === 8 && (
        <TokenCutaway
          local={local}
          time={reducedMotion ? 0 : time}
          corpus={corpus}
          topK={topK}
          playing={playing && !reducedMotion}
        />
      )}
      <g pointerEvents="none">
        <rect x="0" y="738" width="1600" height="162" fill="url(#captionFade)" />
        <text x="65" y="797" fontSize={captionTitle.fontSize} fill="#233d54" fontWeight="400">
          {captionTitle.lines[0]}
        </text>
        <text x="65" y="837" fontSize={captionCopy.fontSize} fill="#708397">
          {captionCopy.lines.map((l, i) => (
            <tspan key={i} x="65" dy={i ? captionCopy.lineHeight : 0}>
              {l}
            </tspan>
          ))}
        </text>
        <text x="1535" y="797" fontSize="20" textAnchor="end" fill="#8da0b0">
          {String(index + 1).padStart(2, '0')} / 10
        </text>
      </g>
    </svg>
  );
}
