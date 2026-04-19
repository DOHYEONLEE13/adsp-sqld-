/**
 * Full-screen fixed texture overlay.
 * Uses a CSS fallback pattern; a `/texture.png` file in `public/` will be
 * layered on top automatically if present.
 */
export default function TextureOverlay() {
  return <div className="texture-overlay" aria-hidden="true" />;
}
