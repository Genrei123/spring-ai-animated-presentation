import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Diagram } from '../../src/features/architecture/Diagram';
import type { MeasureText } from '../../src/shared/text-layout';

export function frame(time: number, measureText?: MeasureText) {
  return renderToStaticMarkup(<Diagram time={time} playing={true} measureText={measureText} />);
}

export * from '../../src/features/architecture/model';
export { layoutNodeText } from '../../src/features/architecture/text-layout';
export { layoutText } from '../../src/shared/text-layout';
