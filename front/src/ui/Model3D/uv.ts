export interface UVFractions {
  uScale: number;
  vScale: number;
  uOffset: number;
  vOffset: number;
}

export interface CssBackground {
  backgroundSize: string;
  backgroundPosition: string;
}

const MC_UV_RANGE = 16;

export function calculateUV(uv: [number, number, number, number] | undefined): UVFractions {
  const [u1, v1, u2, v2] = uv ?? [0, 0, MC_UV_RANGE, MC_UV_RANGE];
  return {
    uScale: (u2 - u1) / MC_UV_RANGE,
    vScale: (v2 - v1) / MC_UV_RANGE,
    uOffset: u1 / MC_UV_RANGE,
    vOffset: v1 / MC_UV_RANGE,
  };
}

export function calculateBackgroundPosition(
  uv: [number, number, number, number] | undefined,
  faceWidthPx: number,
  faceHeightPx: number,
): CssBackground {
  const { uScale, vScale, uOffset, vOffset } = calculateUV(uv);
  if (uScale === 0 || vScale === 0 || faceWidthPx === 0 || faceHeightPx === 0) {
    return { backgroundSize: '100% 100%', backgroundPosition: '0 0' };
  }
  const bgWidth = faceWidthPx / Math.abs(uScale);
  const bgHeight = faceHeightPx / Math.abs(vScale);
  return {
    backgroundSize: `${bgWidth}px ${bgHeight}px`,
    backgroundPosition: `${-uOffset * bgWidth}px ${-vOffset * bgHeight}px`,
  };
}
