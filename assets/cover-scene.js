// The photograph remains the content; only its frame receives a gentle motion.
const host = document.querySelector('.cover-image.cover-editorial');

if (host) {
 const root = document.documentElement;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const connection = navigator.connection;
 const bounds = host.getBoundingClientRect();
 let visible = bounds.bottom > 0 && bounds.top < innerHeight;
 let suspended = false;

 function syncMotion() {
  const moving = visible && !suspended && !document.hidden && !reduced.matches
   && !connection?.saveData && !root.classList.contains('reduced-motion');
  host.classList.toggle('is-cover-moving', moving);
 }

 const intersection = 'IntersectionObserver' in window
  ? new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncMotion();
   }) : null;
 intersection?.observe(host);

 const preferenceObserver = new MutationObserver(syncMotion);
 preferenceObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
 reduced.addEventListener('change', syncMotion);
 connection?.addEventListener?.('change', syncMotion);
 document.addEventListener('visibilitychange', syncMotion);

 function onPageShow() {
  suspended = false;
  syncMotion();
 }

 function onPageHide(event) {
  suspended = true;
  syncMotion();
  // bfcache keeps observers and listeners so the frame can resume on pageshow.
  if (event.persisted) return;
  intersection?.disconnect();
  preferenceObserver.disconnect();
  reduced.removeEventListener('change', syncMotion);
  connection?.removeEventListener?.('change', syncMotion);
  document.removeEventListener('visibilitychange', syncMotion);
  removeEventListener('pageshow', onPageShow);
  removeEventListener('pagehide', onPageHide);
 }

 addEventListener('pageshow', onPageShow);
 addEventListener('pagehide', onPageHide);
 syncMotion();
}
