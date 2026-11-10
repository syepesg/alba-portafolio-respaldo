// Escenario de actividades: pestañas animadas con avance automático hasta que se interactúa.
const grid = document.querySelector('[data-stage]');
if (grid) {
  const cards = [...grid.querySelectorAll('.practice-card')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('reduced-motion');
  const tabs = document.createElement('div');
  tabs.className = 'stage-tabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Prácticas');
  const buttons = cards.map((card, i) => {
    const b = document.createElement('button');
    const title = card.querySelector('h3').textContent.replace(/^Práctica \d+:\s*/, '');
    b.type = 'button'; b.setAttribute('role', 'tab'); b.id = 'tab-' + card.id; b.setAttribute('aria-controls', card.id);
    b.innerHTML = `<span class="st-n">0${i + 1}</span><span class="st-t"></span><span class="st-bar" aria-hidden="true"></span>`;
    b.querySelector('.st-t').textContent = title;
    card.setAttribute('role', 'tabpanel'); card.setAttribute('aria-labelledby', b.id); card.dataset.big = '0' + (i + 1);
    b.addEventListener('click', () => { stop(); show(i); });
    tabs.append(b); return b;
  });
  grid.before(tabs); grid.classList.add('stage-ready');
  const hint = document.createElement('p'); hint.className = 'stage-hint'; hint.textContent = 'Usa las flechas ← → o desliza para cambiar de práctica.';
  grid.after(hint);
  let current = -1, timer = 0, auto = !reduced;
  function show(i, dir) {
    i = (i + cards.length) % cards.length;
    grid.classList.toggle('go-back', dir === -1 || (dir === undefined && i < current));
    cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
    buttons.forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; const bar = b.querySelector('.st-bar'); bar.classList.remove('run'); if (k === i && auto) { void bar.offsetWidth; bar.classList.add('run'); } });
    current = i;
    if (history.replaceState) history.replaceState(null, '', '#' + cards[i].id);
    clearTimeout(timer); if (auto) timer = setTimeout(() => show(current + 1, 1), 7000);
  }
  function stop() { auto = false; clearTimeout(timer); buttons.forEach(b => b.querySelector('.st-bar').classList.remove('run')); }
  tabs.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { stop(); const d = e.key === 'ArrowRight' ? 1 : -1; show(current + d, d); buttons[current].focus(); e.preventDefault(); } });
  document.addEventListener('keydown', e => { if (e.target.closest('input,textarea,[role=tablist]')) return; if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { stop(); const d = e.key === 'ArrowRight' ? 1 : -1; show(current + d, d); } });
  let x0 = null;
  grid.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  grid.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 50) { stop(); const d = dx < 0 ? 1 : -1; show(current + d, d); } });
  grid.addEventListener('pointerenter', () => { if (auto) { clearTimeout(timer); buttons[current].querySelector('.st-bar').style.animationPlayState = 'paused'; } });
  grid.addEventListener('pointerleave', () => { if (auto) { buttons[current].querySelector('.st-bar').style.animationPlayState = ''; show(current); } });
  const start = cards.findIndex(c => '#' + c.id === location.hash);
  if (start >= 0) auto = false;
  show(start >= 0 ? start : 0);
}
