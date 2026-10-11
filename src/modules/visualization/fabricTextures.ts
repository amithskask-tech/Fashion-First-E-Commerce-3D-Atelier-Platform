import * as THREE from 'three';

/**
 * Procedurally generates high-resolution fabric texture maps (Albedo & Bump)
 * for zero-cost, offline PBR rendering without external paid asset dependencies.
 */
export function createFabricTexture(weaveType: string, baseHex: string): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  // Fill base color
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, size, size);

  const col = new THREE.Color(baseHex);

  if (weaveType.toLowerCase().includes('oxford')) {
    // Basketweave pattern (interlaced warp and weft)
    const step = 8;
    for (let x = 0; x < size; x += step) {
      for (let y = 0; y < size; y += step) {
        const isWarp = ((x / step) % 2 === 0 && (y / step) % 2 === 0) || ((x / step) % 2 !== 0 && (y / step) % 2 !== 0);
        ctx.fillStyle = isWarp ? col.clone().offsetHSL(0, 0, 0.04).getStyle() : col.clone().offsetHSL(0, 0, -0.04).getStyle();
        ctx.fillRect(x, y, step, step);

        bumpCtx.fillStyle = isWarp ? '#a0a0a0' : '#606060';
        bumpCtx.fillRect(x, y, step, step);
      }
    }
  } else if (weaveType.toLowerCase().includes('twill')) {
    // 45-degree diagonal twill ribs
    ctx.lineWidth = 3;
    bumpCtx.lineWidth = 3;
    const spacing = 6;
    for (let i = -size; i < size * 2; i += spacing) {
      ctx.strokeStyle = col.clone().offsetHSL(0, 0, (i % (spacing * 2) === 0 ? 0.05 : -0.05)).getStyle();
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + size, size);
      ctx.stroke();

      bumpCtx.strokeStyle = i % (spacing * 2) === 0 ? '#b0b0b0' : '#505050';
      bumpCtx.beginPath();
      bumpCtx.moveTo(i, 0);
      bumpCtx.lineTo(i + size, size);
      bumpCtx.stroke();
    }
  } else if (weaveType.toLowerCase().includes('linen')) {
    // Natural irregular linen slub texture
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * size;
      const ry = Math.random() * size;
      const rw = Math.random() * 20 + 5;
      const rh = Math.random() * 2 + 1;
      const lum = (Math.random() - 0.5) * 0.12;

      ctx.fillStyle = col.clone().offsetHSL(0, 0, lum).getStyle();
      ctx.fillRect(rx, ry, rw, rh);

      bumpCtx.fillStyle = lum > 0 ? '#b8b8b8' : '#484848';
      bumpCtx.fillRect(rx, ry, rw, rh);
    }
  } else {
    // Classic fine Poplin (tight micro-horizontal ribs)
    const step = 4;
    for (let y = 0; y < size; y += step) {
      const isAlt = (y / step) % 2 === 0;
      ctx.fillStyle = col.clone().offsetHSL(0, 0, isAlt ? 0.02 : -0.02).getStyle();
      ctx.fillRect(0, y, size, step);

      bumpCtx.fillStyle = isAlt ? '#909090' : '#707070';
      bumpCtx.fillRect(0, y, size, step);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(6, 6);

  return { map: texture, bumpMap: bump };
}
