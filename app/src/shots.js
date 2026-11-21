// Fixed scenes for the entry's screenshots, named by the `?shot=` query. Each scene is a full cover
// state built from the two sample photos the kit ships (samples/pier.jpg, samples/boulevard.jpg), so a
// screenshot always shows the app with real panels, grades and lettering — the same state a person
// could reach in the editor. main.js applies the scene, then sets window.__shotReady once painted.

/** One panel of a scene: which sample, how far zoomed, where framed, which filter. */
function panel(src, zoom, cx, cy, filter) {
  return { src, zoom, cx, cy, filter };
}

export const SCENES = {
  // The cover screenshot: a wide Classic 5 in the Vice Sunset grade.
  cover: {
    size: '1920x1080',
    layout: 'classic5',
    grade: 'sunset',
    title: 'NEON SHORES',
    subtitle: 'VICE CITY NIGHTS',
    titleColor: '#ffffff',
    panels: [
      panel('pier', 1.05, 0.5, 0.42, 'sunset'),
      panel('boulevard', 1.1, 0.5, 0.4, 'neon'),
      panel('pier', 1.7, 0.35, 0.72, 'dusk'),
      panel('boulevard', 1.45, 0.55, 0.55, 'gold'),
      panel('pier', 1.25, 0.6, 0.5, 'neon'),
    ],
  },
  // A portrait cover on the diagonal duo, in the neon grade.
  cover2: {
    size: '1080x1350',
    layout: 'duo',
    grade: 'neon',
    title: 'PALM HEAT',
    subtitle: 'ONE NIGHT IN THE CITY',
    titleColor: '#ff5da2',
    panels: [
      panel('boulevard', 1.05, 0.5, 0.38, 'neon'),
      panel('pier', 1.1, 0.5, 0.55, 'sunset'),
    ],
  },
  // A square cover on the quad, in the gold grade.
  cover3: {
    size: '1080x1080',
    layout: 'quad',
    grade: 'gold',
    title: 'SHORELINE',
    subtitle: 'NEON SHORES STORIES',
    titleColor: '#ffd23f',
    panels: [
      panel('pier', 1.2, 0.5, 0.4, 'gold'),
      panel('boulevard', 1.3, 0.5, 0.45, 'sunset'),
      panel('boulevard', 1.6, 0.4, 0.65, 'dusk'),
      panel('pier', 1.5, 0.6, 0.6, 'neon'),
    ],
  },
  // The editor as a person first meets it: the portrait Classic 5 already filled with the samples.
  editor: {
    size: '1080x1350',
    layout: 'classic5',
    grade: 'sunset',
    title: 'NEON SHORES',
    subtitle: 'VICE CITY NIGHTS',
    titleColor: '#ffffff',
    panels: [
      panel('pier', 1.05, 0.5, 0.42, 'sunset'),
      panel('boulevard', 1.15, 0.5, 0.4, 'neon'),
      panel('pier', 1.6, 0.4, 0.7, 'dusk'),
      panel('boulevard', 1.4, 0.55, 0.6, 'gold'),
      panel('pier', 1.3, 0.55, 0.5, 'auto'),
    ],
  },
};
