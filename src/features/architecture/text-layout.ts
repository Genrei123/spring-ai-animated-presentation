import { layoutText, measureText, type MeasureText } from '../../shared/text-layout';
import type { Box } from './model';

export function layoutNodeText(box: Box, measure: MeasureText = measureText) {
  const padding = 20;
  const width = box.w - padding * 2;
  const title = layoutText(box.title, width, 60, 24, {
    minSize: 20,
    bold: true,
    leading: 1.25,
    measure,
  });
  const subtitleTop = padding + title.height + 8;
  const subtitle = layoutText(box.sub, width, box.h - subtitleTop - padding, 18, {
    minSize: 16,
    measure,
  });
  return { padding, title, subtitle, subtitleTop };
}
