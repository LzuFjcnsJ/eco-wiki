/**
 * Article table of contents — highlights the section currently under the
 * sticky header. Heading ids come from the content collection renderer, so
 * any `##` heading added to a Markdown file shows up here automatically.
 */

const links = Array.from(document.querySelectorAll('.toc__link'));

if (links.length) {
  const entries = links
    .map((link) => {
      const id = decodeURIComponent((link.getAttribute('href') || '').replace('#', ''));
      const heading = id ? document.getElementById(id) : null;
      return heading ? { link, heading } : null;
    })
    .filter(Boolean);

  let ticking = false;

  const update = () => {
    const offset = 120;
    let activeIndex = 0;

    entries.forEach((entry, index) => {
      if (entry.heading.getBoundingClientRect().top - offset <= 0) activeIndex = index;
    });

    // Pin the last item once the article bottom is reached.
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 80;
    if (nearBottom) activeIndex = entries.length - 1;

    entries.forEach((entry, index) => {
      entry.link.classList.toggle('is-active', index === activeIndex);
    });

    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );

  window.addEventListener('resize', update, { passive: true });
  update();
}
