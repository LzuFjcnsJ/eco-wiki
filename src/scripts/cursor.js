/**
 * Custom cursor — a lerp-followed ring that morphs per target:
 *   default  small ring
 *   card     filled disc with a label (chapter cards / catalog entries)
 *   link     square outline
 *   none     released to the native caret (text fields)
 */

const cursor = document.getElementById('cursor');
const label = document.getElementById('cursor-label');

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (cursor && label && finePointer) {
  document.documentElement.classList.add('has-custom-cursor');

  const VARIANTS = ['is-card', 'is-link', 'is-none'];

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let variant = 'default';

  const setVariant = (next, nextLabel) => {
    const text = nextLabel || '查看';
    if (variant === next && label.textContent === text) return;
    variant = next;
    cursor.classList.remove(...VARIANTS);
    if (next !== 'default') cursor.classList.add(`is-${next}`);
    label.textContent = text;
  };

  window.addEventListener(
    'mousemove',
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      cursor.classList.add('is-visible');
    },
    { passive: true },
  );

  document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
  document.addEventListener('mouseenter', () => cursor.classList.add('is-visible'));

  document.addEventListener('mouseover', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const marked = target.closest('[data-cursor]');
    const field = target.closest('input, textarea, select, [contenteditable="true"]');

    if (field) {
      setVariant('none', '');
      return;
    }
    if (marked) {
      setVariant(marked.getAttribute('data-cursor') || 'default', marked.getAttribute('data-cursor-label') || '');
      return;
    }
    if (target.closest('a, button, [role="button"]')) {
      setVariant('link', '');
      return;
    }
    setVariant('default', '');
  });

  const render = () => {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    cursor.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0)`;
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
}
