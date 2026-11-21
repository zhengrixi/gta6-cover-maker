// The cover renderer: panels of graded photos with white seams, a unifying colour grade, film grain,
// and the bold caption block along the foot. Everything is drawn from the editor state, so the live
// preview and the exported PNG are the same picture at the chosen post size.
import { panelsFor } from './layouts.js';
import { panelFilterCss, paintGrade } from './filters.js';

export const POST_SIZES = [
  { id: '1080x1350', label: 'Portrait 1080 x 1350', w: 1080, h: 1350 },
  { id: '1080x1080', label: 'Square 1080 x 1080', w: 1080, h: 1080 },
  { id: '1920x1080', label: 'Wide 1920 x 1080', w: 1920, h: 1080 },
];

export const TITLE_COLORS = [
  { id: '#ffffff', label: 'White' },
  { id: '#ff5da2', label: 'Vice Pink' },
  { id: '#ffd23f', label: 'Taxi Gold' },
  { id: '#2ee6c8', label: 'Neon Teal' },
];

/** A blank panel: no photo yet, mid-frame, unzoomed, filter on auto. */
export function blankPanel() {
  return { img: null, zoom: 1, cx: 0.5, cy: 0.5, filter: 'auto' };
}

let grainPattern = null;

/** A small tile of random grey noise, drawn over the poster at low alpha for a film feel. */
function grain(ctx) {
  if (!grainPattern) {
    const tile = document.createElement('canvas');
    tile.width = 256;
    tile.height = 256;
    const t = tile.getContext('2d');
    const data = t.createImageData(256, 256);
    for (let i = 0; i < data.data.length; i += 4) {
      const v = 96 + Math.floor(Math.random() * 96);
      data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
      data.data[i + 3] = 255;
    }
    t.putImageData(data, 0, 0);
    grainPattern = ctx.createPattern(tile, 'repeat');
  }
  return grainPattern;
}

/** The polygon scaled from unit space to device pixels, shrunk a frame's width in from the edge. */
function devicePoly(poly, w, h, frame) {
  const cx = w / 2;
  const cy = h / 2;
  return poly.map(([x, y]) => {
    const px = x * w;
    const py = y * h;
    return [cx + (px - cx) * (1 - (2 * frame) / w), cy + (py - cy) * (1 - (2 * frame) / h)];
  });
}

function tracePath(ctx, poly) {
  ctx.beginPath();
  poly.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
}

/** Draws one panel: its photo (or a dusk placeholder) clipped to the polygon, cover-fit and graded. */
function drawPanel(ctx, poly, panel, gradeId) {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const bx = Math.min(...xs);
  const by = Math.min(...ys);
  const bw = Math.max(...xs) - bx;
  const bh = Math.max(...ys) - by;
  ctx.save();
  tracePath(ctx, poly);
  ctx.clip();
  if (panel.img) {
    const iw = panel.img.naturalWidth;
    const ih = panel.img.naturalHeight;
    const scale = Math.max(bw / iw, bh / ih) * panel.zoom;
    const dw = iw * scale;
    const dh = ih * scale;
    // Frame the chosen point at the panel's centre, then clamp so the photo always covers the panel:
    // an off-centre frame must never leave an unpainted wedge inside the seams.
    const dx = Math.min(bx, Math.max(bx + bw - dw, bx + bw / 2 - panel.cx * dw));
    const dy = Math.min(by, Math.max(by + bh - dh, by + bh / 2 - panel.cy * dh));
    ctx.filter = panelFilterCss(panel.filter, gradeId);
    ctx.drawImage(panel.img, dx, dy, dw, dh);
    ctx.filter = 'none';
  } else {
    const g = ctx.createLinearGradient(bx, by, bx, by + bh);
    g.addColorStop(0, '#3a2158');
    g.addColorStop(1, '#12081f');
    ctx.fillStyle = g;
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = `600 ${Math.max(14, bh * 0.07)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', bx + bw / 2, by + bh / 2);
  }
  ctx.restore();
}

/** Draws the subtitle and the big title along the foot of the poster. */
function drawTitle(ctx, w, h, state) {
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim().toUpperCase();
  if (!title && !subtitle) return;
  // A soft dark pool behind the words keeps them readable over any photo.
  const band = ctx.createLinearGradient(0, h * 0.62, 0, h);
  band.addColorStop(0, 'rgba(6, 2, 14, 0)');
  band.addColorStop(1, 'rgba(6, 2, 14, 0.7)');
  ctx.fillStyle = band;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);

  const font = (size) => `900 ${size}px "Arial Black", "Archivo Black", Impact, "Helvetica Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let titleSize = h * 0.125;
  if (title) {
    ctx.font = font(titleSize);
    while (ctx.measureText(title).width > w * 0.92 && titleSize > 14) {
      titleSize -= 3;
      ctx.font = font(titleSize);
    }
  }
  const titleBaseline = h * 0.955;
  if (subtitle) {
    const spaced = subtitle.split('').join(' ');
    let subSize = Math.max(15, h * 0.026);
    ctx.font = `700 ${subSize}px "Helvetica Neue", Arial, sans-serif`;
    while (ctx.measureText(spaced).width > w * 0.9 && subSize > 10) {
      subSize -= 1;
      ctx.font = `700 ${subSize}px "Helvetica Neue", Arial, sans-serif`;
    }
    ctx.fillStyle = state.titleColor === '#ffffff' ? '#ffb3d1' : state.titleColor;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = subSize * 0.35;
    ctx.fillText(spaced, w / 2, titleBaseline - titleSize * 1.08);
    ctx.shadowBlur = 0;
  }
  if (title) {
    ctx.font = font(titleSize);
    ctx.lineJoin = 'round';
    // An offset accent shadow gives the letters their poster pop.
    ctx.fillStyle = 'rgba(226, 38, 124, 0.85)';
    ctx.fillText(title, w / 2 + titleSize * 0.045, titleBaseline + titleSize * 0.05);
    ctx.strokeStyle = '#17092b';
    ctx.lineWidth = titleSize * 0.16;
    ctx.strokeText(title, w / 2, titleBaseline);
    ctx.fillStyle = state.titleColor;
    ctx.fillText(title, w / 2, titleBaseline);
  }
}

/**
 * Draws the whole cover described by `state` onto the canvas at the canvas's own size.
 * state: { layout, panels, grade, title, subtitle, titleColor }
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = '#0b0614';
  ctx.fillRect(0, 0, w, h);
  const frame = Math.max(6, Math.min(w, h) * 0.014);
  const polys = panelsFor(state.layout, w / h).map((p) => devicePoly(p, w, h, frame));
  polys.forEach((poly, i) => drawPanel(ctx, poly, state.panels[i] ?? blankPanel(), state.grade));
  paintGrade(ctx, w, h, state.grade);
  // White seams between the panels and a clean white keyline round the edge.
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(3, Math.min(w, h) * 0.011);
  polys.forEach((poly) => {
    tracePath(ctx, poly);
    ctx.stroke();
  });
  ctx.save();
  ctx.globalAlpha = 0.055;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = grain(ctx);
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  drawTitle(ctx, w, h, state);
}
