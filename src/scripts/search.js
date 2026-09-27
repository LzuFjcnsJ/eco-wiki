/**
 * Wiki search.
 *
 * Two entry points share one index:
 *   · the command palette (header button, or `/` anywhere)
 *   · the inline field on the home page, which answers without navigating away
 *
 * The index is generated at build time from the content collection and
 * includes `##` sections, so "参数" lands on 参数速查表 rather than the
 * top of the photography chapter.
 */

const GROUP_LABEL = {
  core: '核心技能',
  workflow: '流程规范',
  reference: '参考',
  legacy: '数字遗产',
};

const overlay = document.getElementById('search-overlay');
const overlayInput = document.getElementById('search-input');
const overlayResults = document.getElementById('search-results');
const overlayCount = document.getElementById('search-count');

const inlineRoot = document.getElementById('hero-search');
const inlineInput = document.getElementById('hero-search-input');
const inlineResults = document.getElementById('hero-search-results');
const inlineCount = document.getElementById('hero-search-count');

let index = null;
let loading = null;

const loadIndex = () => {
  if (index) return Promise.resolve(index);
  if (!loading) {
    loading = fetch(`${import.meta.env.BASE_URL}search-index.json`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        index = Array.isArray(data) ? data : [];
        return index;
      })
      .catch(() => {
        index = [];
        return index;
      });
  }
  return loading;
};

const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const highlight = (text, query) => {
  const safe = escapeHtml(text);
  if (!query) return safe;
  const pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp(pattern, 'gi'), (match) => `<mark>${match}</mark>`);
};

const score = (entry, query) => {
  const title = String(entry.title).toLowerCase();
  const summary = String(entry.summary).toLowerCase();
  const tags = (entry.tags || []).join(' ').toLowerCase();

  // Section hits beat page hits: a section title match is the most precise answer.
  if (title.includes(query)) return entry.kind === 'page' ? 1 : 0;
  if (tags.includes(query)) return 2;
  if (summary.includes(query)) return 3;
  return 4;
};

const queryIndex = (rawQuery) => {
  const query = rawQuery.trim().toLowerCase();
  const all = index || [];

  if (!query) return all.slice(0, 8);

  return all
    .filter((entry) => {
      const haystack = [entry.title, entry.summary, (entry.tags || []).join(' ')]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => score(a, query) - score(b, query) || a.order - b.order);
};

const hitMarkup = (entry, query, isActive) => `
  <a class="search-hit${isActive ? ' is-active' : ''}" href="${entry.url}" role="option" data-hit-index="${entry.__i}">
    <span class="search-hit__num">${escapeHtml(entry.badge)}</span>
    <span>
      <span class="search-hit__title">${highlight(entry.title, query)}</span>
      <span class="search-hit__summary">${highlight(entry.summary, query)}</span>
    </span>
    <span class="search-hit__group">${GROUP_LABEL[entry.group] || entry.group}</span>
  </a>`;

const EMPTY_MARKUP =
  '<p class="empty-note">没有匹配的内容。换个关键词试试 —— 比如「ISO」「原创」「催稿」「红线」。</p>';

/* ---------------- Command palette ---------------- */

if (overlay && overlayInput && overlayResults) {
  let hits = [];
  let active = 0;
  let lastFocused = null;

  const render = () => {
    const query = overlayInput.value.trim();
    hits = queryIndex(query);
    active = Math.min(active, Math.max(0, hits.length - 1));
    hits.forEach((hit, i) => {
      hit.__i = i;
    });

    overlayResults.innerHTML = hits.length
      ? hits.map((hit) => hitMarkup(hit, query.toLowerCase(), hit.__i === active)).join('')
      : EMPTY_MARKUP;

    if (overlayCount) {
      overlayCount.textContent = query ? `${hits.length} 条结果` : `共 ${(index || []).length} 条`;
    }
  };

  const open = async () => {
    lastFocused = document.activeElement;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    await loadIndex();
    overlayInput.value = '';
    active = 0;
    render();
    overlayInput.focus();
  };

  const close = () => {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  };

  const move = (delta) => {
    if (!hits.length) return;
    active = (active + delta + hits.length) % hits.length;
    render();
    overlayResults.querySelector(`[data-hit-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  };

  document.querySelectorAll('[data-open-search]').forEach((trigger) => {
    trigger.addEventListener('click', open);
  });

  overlayInput.addEventListener('input', () => {
    active = 0;
    render();
  });

  overlayInput.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      move(-1);
    } else if (event.key === 'Enter') {
      const target = hits[active];
      if (target) {
        event.preventDefault();
        window.location.href = target.url;
      }
    }
  });

  overlayResults.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('.search-hit')) close();
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  document.addEventListener('keydown', (event) => {
    const isOpen = overlay.classList.contains('is-open');

    if (event.key === 'Escape' && isOpen) {
      close();
      return;
    }
    if (isOpen) return;

    const inField =
      document.activeElement instanceof HTMLElement &&
      ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);

    if ((event.key === '/' || (event.key === 'k' && (event.metaKey || event.ctrlKey))) && !inField) {
      event.preventDefault();
      open();
    }
  });

  window.addEventListener('pageshow', () => {
    document.body.style.overflow = '';
    overlay.classList.remove('is-open');
  });
}

/* ---------------- Inline home search ---------------- */

if (inlineRoot && inlineInput && inlineResults) {
  let hits = [];
  let active = 0;

  const closeResults = () => {
    inlineResults.hidden = true;
    inlineResults.innerHTML = '';
    active = 0;
  };

  const render = () => {
    const query = inlineInput.value.trim();

    if (!query) {
      closeResults();
      return;
    }

    hits = queryIndex(query).slice(0, 6);
    active = Math.min(active, Math.max(0, hits.length - 1));
    hits.forEach((hit, i) => {
      hit.__i = i;
    });

    inlineResults.innerHTML = hits.length
      ? hits.map((hit) => hitMarkup(hit, query.toLowerCase(), hit.__i === active)).join('')
      : '<p class="empty-note">没有匹配的内容。试试「ISO」「原创」「催稿」。</p>';

    inlineResults.hidden = false;

    if (inlineCount) {
      inlineCount.textContent = `${hits.length} 条结果`;
    }
  };

  loadIndex().then(() => {
    if (inlineCount && index) {
      const sections = index.filter((entry) => entry.kind === 'section').length;
      const pages = index.filter((entry) => entry.kind === 'page').length;
      inlineCount.textContent = `${pages} 章 · ${sections} 节`;
    }
  });

  inlineInput.addEventListener('input', () => {
    active = 0;
    render();
  });

  inlineInput.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!hits.length) render();
      else {
        active = (active + 1) % hits.length;
        render();
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (hits.length) {
        active = (active - 1 + hits.length) % hits.length;
        render();
      }
    } else if (event.key === 'Enter') {
      const target = hits[active];
      if (target) {
        event.preventDefault();
        window.location.href = target.url;
      }
    } else if (event.key === 'Escape') {
      inlineInput.value = '';
      closeResults();
      inlineInput.blur();
    }
  });

  inlineInput.addEventListener('focus', () => {
    if (inlineInput.value.trim()) render();
  });

  document.addEventListener('click', (event) => {
    if (event.target instanceof Node && !inlineRoot.contains(event.target)) closeResults();
  });

  // Typing anywhere on the page jumps into the home search.
  document.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key.length !== 1) return;
    if (document.activeElement instanceof HTMLElement) {
      const tag = document.activeElement.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
    }
    inlineInput.focus();
  });
}
