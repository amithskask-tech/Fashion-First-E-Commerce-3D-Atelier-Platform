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
  } else if (weaveType.toLowerCase().includes('raw silk') || weaveType.toLowerCase().includes('chanderi')) {
    // Rich textured Indian Raw Silk / Chanderi with horizontal & vertical slubs
    for (let i = 0; i < 3500; i++) {
      const rx = Math.random() * size;
      const ry = Math.random() * size;
      const isHorizontal = Math.random() > 0.3;
      const rw = isHorizontal ? Math.random() * 28 + 6 : Math.random() * 2 + 1;
      const rh = isHorizontal ? Math.random() * 2 + 1 : Math.random() * 20 + 4;
      const lum = (Math.random() - 0.5) * 0.16;

      ctx.fillStyle = col.clone().offsetHSL(0, 0, lum).getStyle();
      ctx.fillRect(rx, ry, rw, rh);

      bumpCtx.fillStyle = lum > 0 ? '#cccccc' : '#444444';
      bumpCtx.fillRect(rx, ry, rw, rh);
    }
  } else if (weaveType.toLowerCase().includes('khadi') || weaveType.toLowerCase().includes('handloom')) {
    // Organic Indian Khadi Handspun cotton with cross-hatch handloom grain
    const step = 6;
    for (let x = 0; x < size; x += step) {
      for (let y = 0; y < size; y += step) {
        const jitter = (Math.random() - 0.5) * 0.1;
        ctx.fillStyle = col.clone().offsetHSL(0, 0, jitter).getStyle();
        ctx.fillRect(x, y, step, step);

        bumpCtx.fillStyle = jitter > 0 ? '#b0b0b0' : '#555555';
        bumpCtx.fillRect(x, y, step, step);
      }
    }
  } else if (weaveType.toLowerCase().includes('chikankari') || weaveType.toLowerCase().includes('embroidered')) {
    // Delicate tone-on-tone Lucknowi shadow and floral relief embroidery
    const step = 32;
    for (let x = 0; x < size; x += step) {
      for (let y = 0; y < size; y += step) {
        ctx.fillStyle = col.clone().offsetHSL(0, 0, 0.08).getStyle();
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 7, 0, Math.PI * 2);
        ctx.fill();

        bumpCtx.fillStyle = '#ffffff';
        bumpCtx.beginPath();
        bumpCtx.arc(x + 16, y + 16, 7, 0, Math.PI * 2);
        bumpCtx.fill();
      }
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

/**
 * Generates an authentic metallic Kerala Kasavu gold zari border texture with
 * traditional woven diamond chevron and temple border motifs.
 */
export function createZariTexture(): {
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

  // Radiant metallic gold base with woven thread shimmer
  const goldGradient = ctx.createLinearGradient(0, 0, size, 0);
  goldGradient.addColorStop(0, '#c59b27');
  goldGradient.addColorStop(0.25, '#f5d77f');
  goldGradient.addColorStop(0.5, '#e5be3c');
  goldGradient.addColorStop(0.75, '#ffd700');
  goldGradient.addColorStop(1, '#b38712');
  ctx.fillStyle = goldGradient;
  ctx.fillRect(0, 0, size, size);

  bumpCtx.fillStyle = '#909090';
  bumpCtx.fillRect(0, 0, size, size);

  // Traditional Kasavu temple & diamond chevron motifs
  ctx.fillStyle = '#8b6914';
  bumpCtx.fillStyle = '#f0f0f0';
  const rowHeight = 32;
  for (let y = 0; y < size; y += rowHeight) {
    for (let x = 0; x < size; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x + 16, y + 4);
      ctx.lineTo(x + 28, y + 16);
      ctx.lineTo(x + 16, y + 28);
      ctx.lineTo(x + 4, y + 16);
      ctx.closePath();
      ctx.fill();

      bumpCtx.beginPath();
      bumpCtx.moveTo(x + 16, y + 4);
      bumpCtx.lineTo(x + 28, y + 16);
      bumpCtx.lineTo(x + 16, y + 28);
      bumpCtx.lineTo(x + 4, y + 16);
      bumpCtx.closePath();
      bumpCtx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 2);

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(8, 2);

  return { map: texture, bumpMap: bump };
}
