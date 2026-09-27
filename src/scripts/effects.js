/**
 * Hero effects — the two signature references combined:
 *   · nk.studio  → slow drifting star-field on <canvas>
 *   · Alethia    → mineral objects with mouse parallax and entrance fade
 * Runs only on pages that ship the hero markup.
 */

const canvas = document.getElementById('particle-field');

/* ---------------- Star field ---------------- */
if (canvas instanceof HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  const count = Number(canvas.dataset.particleCount || 150);
  const color = canvas.dataset.particleColor || '#20E5B5';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];
  let frame = 0;

  const rgb = (() => {
    const hex = color.replace('#', '');
    const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  })();

  const seed = () => {
    stars = Array.from({ length: count }, () => {
      const depth = Math.random();
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.4 + depth * 1.5,
        alpha: 0.12 + depth * 0.5,
        driftX: (Math.random() - 0.5) * 0.12,
        driftY: -(0.04 + depth * 0.16),
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.4 + Math.random() * 1.1,
        depth,
      };
    });
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  };

  const draw = (time) => {
    ctx.clearRect(0, 0, width, height);
    const t = time * 0.001;

    for (const star of stars) {
      star.x += star.driftX;
      star.y += star.driftY;

      if (star.y < -4) star.y = height + 4;
      if (star.x < -4) star.x = width + 4;
      if (star.x > width + 4) star.x = -4;

      const pulse = 0.72 + Math.sin(t * star.twinkle + star.phase) * 0.28;
      const alpha = star.alpha * pulse;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(3)})`;
      ctx.fill();

      if (star.depth > 0.82) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 3.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${(alpha * 0.12).toFixed(3)})`;
        ctx.fill();
      }
    }
  };

  const loop = (time) => {
    draw(time);
    frame = requestAnimationFrame(loop);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });

  if (reduceMotion) {
    draw(0);
  } else {
    frame = requestAnimationFrame(loop);

    // Pause the loop while the hero is off-screen.
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!frame) frame = requestAnimationFrame(loop);
          } else if (frame) {
            cancelAnimationFrame(frame);
            frame = 0;
          }
        },
        { threshold: 0 },
      );
      observer.observe(canvas);
    }
  }
}

/* ---------------- Mineral parallax ---------------- */
const rocks = Array.from(document.querySelectorAll('[data-rock]'));

if (rocks.length) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = rocks[0].closest('.hero') || document.body;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let running = false;

  const tick = () => {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    for (const rock of rocks) {
      const depth = Number(rock.dataset.depth || 0.03);
      rock.style.setProperty('--px', `${(currentX * depth * 100).toFixed(2)}px`);
      rock.style.setProperty('--py', `${(currentY * depth * 100).toFixed(2)}px`);
    }

    if (Math.abs(targetX - currentX) > 0.0005 || Math.abs(targetY - currentY) > 0.0005) {
      requestAnimationFrame(tick);
    } else {
      running = false;
    }
  };

  const wake = () => {
    if (running) return;
    running = true;
    requestAnimationFrame(tick);
  };

  if (!reduceMotion) {
    window.addEventListener(
      'mousemove',
      (event) => {
        targetX = (event.clientX / window.innerWidth) * 2 - 1;
        targetY = (event.clientY / window.innerHeight) * 2 - 1;
        wake();
      },
      { passive: true },
    );
  }

  hero.classList.add('has-rocks');
  window.setTimeout(() => {
    rocks.forEach((rock) => rock.classList.add('is-in'));
  }, 260);
}
