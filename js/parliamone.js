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

  // ---- form: solo visivo, nessun backend. Apre un mailto: reale con oggetto fisso e corpo
  // precompilato dai campi — nessun invio simulato, nessun alert/toast finto ----
  const pgForm=$('pgForm');
  pgForm.addEventListener('submit',e=>{
    e.preventDefault();
    const name=$('pgName').value.trim();
    const email=$('pgEmail').value.trim();
    const need=$('pgNeed').value.trim();
    const subject='Richiesta dal sito Due.Zero';
    const bodyLines=[
      name?('Nome e azienda: '+name):null,
      email?('Email: '+email):null,
      need?('Di cosa ha bisogno:\n'+need):null
    ].filter(Boolean);
    const body=bodyLines.join('\n\n');
    window.location.href='mailto:info@duezero.eu?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  });
})();
