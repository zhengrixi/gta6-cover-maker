// Colour work for the cover maker. A panel filter is a CSS filter string applied while that panel's
// photo is drawn; a cover grade is a set of translucent overlays painted over the whole poster once
// the panels are in, which is what sells the Vice City sunset / neon look.

export const PANEL_FILTERS = [
  { id: 'auto', label: 'Auto (cover grade)' },
  { id: 'sunset', label: 'Sunset', css: 'saturate(1.35) contrast(1.08) brightness(1.04) sepia(0.22) hue-rotate(-8deg)' },
  { id: 'neon', label: 'Neon', css: 'saturate(1.65) contrast(1.16) brightness(1.02) hue-rotate(10deg)' },
  { id: 'gold', label: 'Gold Hour', css: 'sepia(0.45) saturate(1.3) contrast(1.05) brightness(1.06)' },
  { id: 'dusk', label: 'Dusk', css: 'brightness(0.9) contrast(1.14) saturate(1.25) hue-rotate(-16deg)' },
  { id: 'mono', label: 'Noir', css: 'grayscale(1) contrast(1.18) brightness(1.02)' },
  { id: 'none', label: 'None', css: '' },
];

/** The CSS filter for a panel whose filter is `id`, under cover grade `gradeId`. */
export function panelFilterCss(id, gradeId) {
  if (id !== 'auto') return PANEL_FILTERS.find((f) => f.id === id)?.css ?? '';
  // Auto borrows the grade's own flavour, a touch gentler than the named filter.
  switch (gradeId) {
    case 'neon': return 'saturate(1.5) contrast(1.12) hue-rotate(6deg)';
    case 'gold': return 'sepia(0.32) saturate(1.25) contrast(1.05) brightness(1.04)';
    case 'mono': return 'grayscale(0.85) contrast(1.14)';
    case 'sunset':
    default: return 'saturate(1.3) contrast(1.07) brightness(1.03) sepia(0.16) hue-rotate(-6deg)';
  }
}

export const GRADES = [
  { id: 'sunset', label: 'Vice Sunset' },
  { id: 'neon', label: 'Neon Nights' },
  { id: 'gold', label: 'Gold Hour' },
  { id: 'mono', label: 'Noir' },
];

/** Paints the grade overlays (sky tint, low sun, vignette) over the finished panels. */
export function paintGrade(ctx, w, h, gradeId) {
  if (gradeId === 'neon') {
    let g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(20, 220, 200, 0.20)');
    g.addColorStop(0.45, 'rgba(30, 10, 60, 0.05)');
    g.addColorStop(1, 'rgba(255, 45, 150, 0.32)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else if (gradeId === 'gold') {
    let g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255, 190, 80, 0.16)');
    g.addColorStop(0.6, 'rgba(255, 120, 40, 0.10)');
    g.addColorStop(1, 'rgba(160, 60, 10, 0.28)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else if (gradeId === 'mono') {
    let g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(0, 0, 0, 0.18)');
    g.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0.30)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else {
    // Vice Sunset: cool violet sky up top, hot coral and magenta pooling at the foot.
    let g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(38, 12, 74, 0.30)');
    g.addColorStop(0.38, 'rgba(255, 110, 60, 0.10)');
    g.addColorStop(0.72, 'rgba(255, 80, 70, 0.20)');
    g.addColorStop(1, 'rgba(226, 38, 124, 0.38)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  // Vignette on every grade: dark corners pull the eye to the middle of the poster.
  const r = Math.hypot(w, h) * 0.72;
  const v = ctx.createRadialGradient(w / 2, h / 2, r * 0.45, w / 2, h / 2, r);
  v.addColorStop(0, 'rgba(4, 0, 12, 0)');
  v.addColorStop(1, 'rgba(4, 0, 12, 0.38)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}
