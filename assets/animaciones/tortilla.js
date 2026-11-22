// La tortillita se desinfla (se aplasta) y cae: 520 ms, solo transform + opacity. Al final queda vacía.
export function tortillaPierde(el) {
  if (!el) return;
  const fin = () => { el.classList.add('vacia'); };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.hasAttribute('data-oculta')) return fin();
  const a = el.animate([
    { transform: 'scale(1,1)', opacity: 1 },
    { transform: 'scale(1.25,.45)', opacity: 1, offset: .35, easing: 'cubic-bezier(.23,1,.32,1)' },
    { transform: 'translateY(46px) scale(.7,.2) rotate(18deg)', opacity: 0 },
  ], { duration: 520, easing: 'cubic-bezier(.23,1,.32,1)' });
  a.onfinish = () => { fin(); el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'ease-out' }); };
  a.oncancel = fin;
}
