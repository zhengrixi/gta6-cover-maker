// Panel layouts for the cover maker. Each layout is a list of polygons in unit space (0..1 on both axes);
// the renderer scales them to the canvas, clips each panel's photo to its polygon and strokes the seams
// white, which is what gives the multi-panel GTA poster look. `panelsFor` returns the polygons for a
// layout at a given aspect (width / height), because the five-panel classic reads differently wide.

/** A rectangle polygon from x, y, w, h in unit space. */
function rect(x, y, w, h) {
  return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
}

export const LAYOUTS = [
  { id: 'classic5', label: 'Classic 5' },
  { id: 'hero', label: 'Hero' },
  { id: 'trio', label: 'Trio' },
  { id: 'duo', label: 'Diagonal Duo' },
  { id: 'quad', label: 'Quad' },
];

/** The polygons of layout `id` at aspect `aspect`, in unit space. */
export function panelsFor(id, aspect) {
  const wide = aspect >= 1.2;
  switch (id) {
    case 'hero':
      return [rect(0, 0, 1, 1)];
    case 'trio':
      return [rect(0, 0, 0.34, 1), rect(0.34, 0, 0.33, 1), rect(0.67, 0, 0.33, 1)];
    case 'duo':
      // A slanted split: the seam runs from 62% across the top to 38% across the foot.
      return [
        [[0, 0], [0.62, 0], [0.38, 1], [0, 1]],
        [[0.62, 0], [1, 0], [1, 1], [0.38, 1]],
      ];
    case 'quad':
      return [rect(0, 0, 0.5, 0.5), rect(0.5, 0, 0.5, 0.5), rect(0, 0.5, 0.5, 0.5), rect(0.5, 0.5, 0.5, 0.5)];
    case 'classic5':
    default:
      if (wide) {
        return [
          rect(0, 0, 0.52, 1),
          rect(0.52, 0, 0.48, 0.34),
          rect(0.52, 0.34, 0.24, 0.33),
          rect(0.76, 0.34, 0.24, 0.33),
          rect(0.52, 0.67, 0.48, 0.33),
        ];
      }
      return [
        rect(0, 0, 1, 0.52),
        rect(0, 0.52, 0.5, 0.24),
        rect(0.5, 0.52, 0.5, 0.24),
        rect(0, 0.76, 0.5, 0.24),
        rect(0.5, 0.76, 0.5, 0.24),
      ];
  }
}

/** How many photo panels layout `id` holds at aspect `aspect`. */
export function panelCount(id, aspect) {
  return panelsFor(id, aspect).length;
}
