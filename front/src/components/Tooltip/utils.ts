export interface Coordinates {
  x: number;
  y: number;
}

export enum Anchor {
  TOP_LEFT,
  TOP_RIGHT,
  BOTTOM_LEFT,
  BOTTOM_RIGHT,
}

export function getTooltipPosition(
  coordinates: Coordinates,
  tooltip: HTMLDivElement,
  offset: number,
  anchor: Anchor,
): { x: number; y: number } {
  const { x: clientX, y: clientY } = coordinates;
  const { width, height } = tooltip.getBoundingClientRect();
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  let x = clientX;
  let y = clientY;

  switch (anchor) {
    case Anchor.TOP_LEFT:
      x -= width + offset;
      y -= height + offset;
      break;
    case Anchor.TOP_RIGHT:
      x += offset;
      y -= height + offset;
      break;
    case Anchor.BOTTOM_LEFT:
      x -= width + offset;
      y += offset;
      break;
    case Anchor.BOTTOM_RIGHT:
      x += offset;
      y += offset;
      break;
  }

  x = Math.max(offset, Math.min(x, screenWidth - width - offset));
  y = Math.max(offset, Math.min(y, screenHeight - height - offset));

  return { x, y };
}
