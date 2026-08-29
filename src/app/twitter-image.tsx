// Next only wires og:image from opengraph-image; twitter:image needs its own
// file, so this reuses the same generator rather than duplicating the design.
export { default, size, contentType, alt } from "./opengraph-image";
