(function(){
  const $=id=>document.getElementById(id);
  const menuBtn=$('menuBtn'), overlay=$('overlay'), closeBtn=$('closeBtn');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- menu: identico alla homepage ----
  menuBtn.addEventListener('click',()=>overlay.classList.add('open'));
  closeBtn.addEventListener('click',()=>overlay.classList.remove('open'));
  overlay.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>overlay.classList.remove('open')));
  addEventListener('keydown',e=>{if(e.key==='Escape')overlay.classList.remove('open');});

  // ---- anno legale ----
  const footerYear=$('footerYear');
  if(footerYear) footerYear.textContent=new Date().getFullYear();

  if(!reduce){
    // ---- hero: reveal al caricamento (non scroll-linked, la sezione è già in vista) ----
    const pgHero=$('pgHero');
    requestAnimationFrame(()=>requestAnimationFrame(()=>pgHero.classList.add('revealed')));

    // ---- reveal-on-enter riusabile per le sezioni successive (stessa tecnica del footer homepage:
    // nessuno sticky, nessun progresso continuo — un solo scatto quando la sezione entra in viewport) ----
    const revealTargets=[$('pgContact'),$('pgClose')];
    function checkReveal(){
      let pending=false;
      revealTargets.forEach(el=>{
        if(!el || el.classList.contains('revealed')) return;
        const r=el.getBoundingClientRect();
        if(r.top<innerHeight*0.85){ el.classList.add('revealed'); }
        else pending=true;
      });
      if(!pending) removeEventListener('scroll',checkReveal);
    }
    addEventListener('scroll',checkReveal,{passive:true});
    checkReveal();
  } else {
    $('pgHero').classList.add('revealed');
    $('pgContact').classList.add('revealed');
    $('pgClose').classList.add('revealed');
  }

  // ---- form: ora un iframe verso www.duezero.eu (invio vero, gestito lato server). L'iframe comunica
  // la propria altezza reale via postMessage — senza, resterebbe fissa a 560px (il valore di partenza
  // nello style inline), tagliando il form se il contenuto è più alto o lasciando vuoto se più basso.
  // Controllo sull'origine del messaggio: solo il dominio del form può ridimensionarlo, non chiunque ----
  addEventListener('message',e=>{
    if(e.origin!=='https://www.duezero.eu') return;
    if(!e.data || e.data.dzContactForm!==true) return;
    const f=$('dzContactFrame');
    if(f && e.data.height) f.style.height=e.data.height+'px';
  });
})();
