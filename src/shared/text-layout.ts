export type MeasureText = (text: string, size: number, bold: boolean) => number;

let measuringContext: CanvasRenderingContext2D | null = null;

export const measureText: MeasureText = (text, size, bold) => {
  if (!measuringContext && typeof document !== 'undefined') {
    measuringContext = document.createElement('canvas').getContext('2d');
  }
  if (!measuringContext) return text.length * size * 0.6;
  measuringContext.font = `${bold ? 600 : 400} ${size}px Arial`;
  return measuringContext.measureText(text).width;
};

/** Wrap by rendered width, including prompts containing long unbroken words. */
export function wrapText(text: string, width: number, measure: (text: string) => number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.trim().split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (measure(next) <= width) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    line = '';
    for (const character of word) {
      if (line && measure(line + character) > width) {
        lines.push(line);
        line = '';
      }
      line += character;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function layoutText(
  text: string,
  width: number,
  height: number,
  size: number,
  {
    minSize = size,
    bold = false,
    leading = 1.3,
    measure = measureText,
  }: { minSize?: number; bold?: boolean; leading?: number; measure?: MeasureText } = {},
) {
  let fontSize = size;
  let lines = wrapText(text, width, (value) => measure(value, fontSize, bold));
  while (fontSize > minSize && lines.length * fontSize * leading > height) {
    fontSize = Math.max(minSize, fontSize - 0.5);
    lines = wrapText(text, width, (value) => measure(value, fontSize, bold));
  }
  const lineHeight = fontSize * leading;
  const maxLines = Math.max(1, Math.floor(height / lineHeight));
  const truncated = lines.length > maxLines;
  if (truncated) {
    lines = lines.slice(0, maxLines);
    let last = lines[maxLines - 1];
    while (last && measure(`${last}…`, fontSize, bold) > width) last = last.slice(0, -1);
    lines[maxLines - 1] = `${last.trimEnd()}…`;
  }
  return { lines, fontSize, lineHeight, height: lines.length * lineHeight, truncated };
}
