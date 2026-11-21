// Neon Shores cover maker: wires the editor page to the renderer. A person picks a layout, fills its
// panels with their own photos (read locally, never uploaded), drags and zooms each photo inside its
// panel, picks a grade and per-panel filters, edits the caption and exports a PNG at a post size.
// A `?shot=` query instead sets up one of the fixed scenes in ./shots.js for the entry's screenshots.
import { drawCover, blankPanel, POST_SIZES, TITLE_COLORS } from './cover.js';
import { LAYOUTS, panelCount } from './layouts.js';
import { PANEL_FILTERS, GRADES } from './filters.js';
import { SCENES } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');

const state = {
  layout: 'classic5',
  size: POST_SIZES[0],
  grade: 'sunset',
  title: 'NEON SHORES',
  subtitle: 'VICE CITY NIGHTS',
  titleColor: '#ffffff',
  panels: [],
  selected: 0,
};

/** Loads an image from a URL (a local file or one of the samples), resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  drawCover(canvas, state);
}

/** Keeps the panel list the length the current layout and size need, keeping photos already placed. */
function syncPanels() {
  const need = panelCount(state.layout, state.size.w / state.size.h);
  while (state.panels.length < need) state.panels.push(blankPanel());
  state.panels.length = need;
  if (state.selected >= need) state.selected = 0;
}

/** Rebuilds the layout and panel chip rows, marking the current choices. */
function buildChips() {
  const layoutsEl = document.getElementById('layouts');
  layoutsEl.innerHTML = '';
  LAYOUTS.forEach(({ id, label }) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.className = id === state.layout ? 'chip on' : 'chip';
    b.addEventListener('click', () => {
      state.layout = id;
      syncPanels();
      buildChips();
      redraw();
    });
    layoutsEl.appendChild(b);
  });
  const panelsEl = document.getElementById('panels');
  panelsEl.innerHTML = '';
  state.panels.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(i + 1);
    b.className = i === state.selected ? 'chip on' : 'chip';
    b.addEventListener('click', () => selectPanel(i));
    panelsEl.appendChild(b);
  });
  document.getElementById('panelName').textContent = `— panel ${state.selected + 1} of ${state.panels.length}`;
  document.getElementById('panelFilter').value = state.panels[state.selected].filter;
}

function selectPanel(i) {
  state.selected = i;
  buildChips();
}

/** Puts an image into the selected panel, framed centre, and repaints. */
function setPanelImage(img) {
  const p = state.panels[state.selected];
  p.img = img;
  p.zoom = 1;
  p.cx = 0.5;
  p.cy = 0.5;
  redraw();
}

function fillSelect(id, options) {
  const el = document.getElementById(id);
  el.innerHTML = '';
  options.forEach(({ id: value, label }) => {
    const o = document.createElement('option');
    o.value = value;
    o.textContent = label;
    el.appendChild(o);
  });
  return el;
}

function wireControls() {
  document.getElementById('photo').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPanelImage(await loadImage(URL.createObjectURL(file)));
    status.textContent = `Panel ${state.selected + 1} filled from your photo.`;
  });
  document.getElementById('samplePier').addEventListener('click', async () => {
    setPanelImage(await loadImage('samples/pier.jpg'));
  });
  document.getElementById('sampleBlvd').addEventListener('click', async () => {
    setPanelImage(await loadImage('samples/boulevard.jpg'));
  });
  document.getElementById('fillAll').addEventListener('click', () => {
    const src = state.panels[state.selected];
    if (!src.img) return;
    state.panels.forEach((p) => {
      p.img = src.img;
      p.zoom = 1;
      p.cx = 0.5;
      p.cy = 0.5;
    });
    redraw();
  });
  document.getElementById('panelFilter').addEventListener('change', (e) => {
    state.panels[state.selected].filter = e.target.value;
    redraw();
  });
  document.getElementById('title').addEventListener('input', (e) => {
    state.title = e.target.value;
    redraw();
  });
  document.getElementById('subtitle').addEventListener('input', (e) => {
    state.subtitle = e.target.value;
    redraw();
  });
  fillSelect('titleColor', TITLE_COLORS).addEventListener('change', (e) => {
    state.titleColor = e.target.value;
    redraw();
  });
  fillSelect('grade', GRADES).addEventListener('change', (e) => {
    state.grade = e.target.value;
    redraw();
  });
  const sizeEl = fillSelect('size', POST_SIZES);
  sizeEl.addEventListener('change', (e) => {
    state.size = POST_SIZES.find((s) => s.id === e.target.value);
    canvas.width = state.size.w;
    canvas.height = state.size.h;
    syncPanels();
    buildChips();
    redraw();
  });
  document.getElementById('export').addEventListener('click', () => {
    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `neon-shores-${state.size.w}x${state.size.h}.png`;
      a.click();
      status.textContent = `Saved neon-shores-${state.size.w}x${state.size.h}.png`;
    }, 'image/png');
  });
  // Dragging on the canvas moves the selected panel's photo; the wheel zooms it.
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = state.panels[state.selected];
    if (!p.img) return;
    const rect = canvas.getBoundingClientRect();
    const kx = canvas.width / rect.width;
    const ky = canvas.height / rect.height;
    const dx = (e.clientX - drag.x) * kx;
    const dy = (e.clientY - drag.y) * ky;
    drag = { x: e.clientX, y: e.clientY };
    // The drawn size of the photo, mirroring the renderer's cover-fit.
    const scale = Math.max(canvas.width / p.img.naturalWidth, canvas.height / p.img.naturalHeight) * p.zoom;
    p.cx = Math.min(1, Math.max(0, p.cx - dx / (p.img.naturalWidth * scale)));
    p.cy = Math.min(1, Math.max(0, p.cy - dy / (p.img.naturalHeight * scale)));
    redraw();
  });
  canvas.addEventListener('pointerup', () => (drag = null));
  canvas.addEventListener('wheel', (e) => {
    const p = state.panels[state.selected];
    if (!p.img) return;
    e.preventDefault();
    p.zoom = Math.min(4, Math.max(1, p.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
    redraw();
  }, { passive: false });
}

/** Applies a fixed screenshot scene: size, layout, words and sample-filled panels. */
async function applyScene(scene) {
  state.size = POST_SIZES.find((s) => s.id === scene.size);
  canvas.width = state.size.w;
  canvas.height = state.size.h;
  state.layout = scene.layout;
  state.grade = scene.grade;
  state.title = scene.title;
  state.subtitle = scene.subtitle;
  state.titleColor = scene.titleColor;
  syncPanels();
  const cache = {};
  for (let i = 0; i < scene.panels.length; i++) {
    const cfg = scene.panels[i];
    cache[cfg.src] ??= await loadImage(`samples/${cfg.src}.jpg`);
    state.panels[i] = { img: cache[cfg.src], zoom: cfg.zoom, cx: cfg.cx, cy: cfg.cy, filter: cfg.filter };
  }
  redraw();
}

/** Mirrors the state into the control inputs, so the editor shows what the cover holds. */
function syncInputs() {
  document.getElementById('title').value = state.title;
  document.getElementById('subtitle').value = state.subtitle;
  document.getElementById('titleColor').value = state.titleColor;
  document.getElementById('grade').value = state.grade;
  document.getElementById('size').value = state.size.id;
}

const shot = new URLSearchParams(location.search).get('shot');
if (shot && SCENES[shot]) {
  if (shot !== 'editor') document.body.classList.add('shot-cover');
  if (shot === 'editor') {
    wireControls();
    fillSelect('panelFilter', PANEL_FILTERS);
  }
  applyScene(SCENES[shot]).then(() => {
    if (shot === 'editor') {
      syncInputs();
      buildChips();
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.__shotReady = true;
    }));
  });
} else {
  wireControls();
  fillSelect('panelFilter', PANEL_FILTERS);
  syncPanels();
  applyScene(SCENES.editor).then(() => buildChips());
}
