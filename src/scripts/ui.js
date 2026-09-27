/**
 * Shared chrome behaviour: loading bar, sticky header, mobile nav,
 * back-to-top, reading progress, catalog filters, checklist memory.
 */

const on = (el, type, handler, opts) => el && el.addEventListener(type, handler, opts);
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------------- Loading bar ---------------- */
(function loadingBar() {
  const bar = document.getElementById('loader-bar');
  const fill = document.getElementById('loader-bar-fill');
  if (!bar || !fill) return;

  requestAnimationFrame(() => {
    fill.style.width = '32%';
  });
  window.setTimeout(() => {
    fill.style.width = '74%';
  }, 240);

  const finish = () => {
    fill.style.width = '100%';
    bar.classList.add('is-done');
    window.setTimeout(() => bar.classList.add('is-gone'), 720);
  };

  if (document.readyState === 'complete') {
    window.setTimeout(finish, 420);
  } else {
    window.addEventListener('load', () => window.setTimeout(finish, 420), { once: true });
  }
})();

/* ---------------- Header + to-top + progress (one scroll loop) ---------------- */
(function scrollChrome() {
  const header = document.getElementById('site-header');
  const toTop = document.getElementById('to-top');
  const progress = qs('.read-progress');
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-stuck', y > 24);
    if (toTop) toTop.classList.toggle('is-visible', y > 640);

    if (progress) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      progress.style.width = `${(ratio * 100).toFixed(2)}%`;
    }
    ticking = false;
  };

  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  update();

  on(toTop, 'click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ---------------- Mobile nav ---------------- */
(function mobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const panel = document.getElementById('mobile-nav');
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  };

  on(toggle, 'click', () => setOpen(panel.hidden));
  qsa('.mobile-nav__link', panel).forEach((link) => on(link, 'click', () => setOpen(false)));
  on(document, 'keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });
})();

/* ---------------- Catalog group filters ---------------- */
(function catalogFilter() {
  const chips = qsa('[data-filter-value]');
  if (!chips.length) return;

  const cards = qsa('.chapter-card');
  const countEl = qs('[data-filter-count]');
  const emptyNote = qs('[data-filter-empty]');
  const groupHeads = qsa('[data-group-head]');

  const apply = (value) => {
    let visible = 0;
    cards.forEach((card) => {
      const show = value === 'all' || card.dataset.group === value;
      card.hidden = !show;
      if (show) visible += 1;
    });

    groupHeads.forEach((head) => {
      const headGroup = head.dataset.groupHead;
      const anyVisible = cards.some((card) => card.dataset.group === headGroup && !card.hidden);
      head.hidden = !anyVisible || value !== 'all';
    });

    if (countEl) countEl.textContent = `${visible} / ${cards.length} 章`;
    if (emptyNote) emptyNote.hidden = visible !== 0;
  };

  chips.forEach((chip) => {
    on(chip, 'click', () => {
      chips.forEach((other) => other.setAttribute('aria-pressed', String(other === chip)));
      apply(chip.dataset.filterValue || 'all');
    });
  });

  apply('all');
})();

/* ---------------- Checklist memory ----------------
   Tutorial checklists are re-used on every activity; remembering tick
   state per page keeps the wiki actually operational between visits. */
(function checklistMemory() {
  const boxes = qsa('.prose input[type="checkbox"]');
  if (!boxes.length) return;

  const key = `eco-wiki:check:${location.pathname}`;

  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    saved = {};
  }

  boxes.forEach((box, index) => {
    const id = box.closest('li')?.id || String(index);
    if (saved[id]) box.checked = true;
    on(box, 'change', () => {
      saved[id] = box.checked;
      try {
        localStorage.setItem(key, JSON.stringify(saved));
      } catch {
        /* storage may be unavailable in private mode — degrade quietly */
      }
    });
  });

  const reset = qs('[data-reset-checklist]');
  on(reset, 'click', () => {
    boxes.forEach((box) => {
      box.checked = false;
    });
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  });
})();
