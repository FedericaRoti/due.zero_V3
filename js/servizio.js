(function(){
  const $=id=>document.getElementById(id);
  const menuBtn=$('menuBtn'), overlay=$('overlay'), closeBtn=$('closeBtn');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- menu + sottomenu: stessa logica di capitolo1.js (hover a lato su desktop, accordion su mobile) ----
  const menuItems=overlay.querySelectorAll('.menuItem');
  function closeOverlay(){ overlay.classList.remove('open'); menuItems.forEach(mi=>mi.classList.remove('open')); }
  menuBtn.addEventListener('click',()=>overlay.classList.add('open'));
  closeBtn.addEventListener('click',closeOverlay);
  overlay.querySelectorAll('a:not(.menuMain)').forEach(a=>a.addEventListener('click',closeOverlay));
  addEventListener('keydown',e=>{if(e.key==='Escape')closeOverlay();});
  const isMobileMenu=()=>matchMedia('(max-width:820px)').matches;

  menuItems.forEach(item=>{
    const toggle=item.querySelector('.menuToggle');
    const submenu=item.querySelector('.submenu');
    const main=item.querySelector('.menuMain');
    let hideTimer=null;
    item.addEventListener('mouseenter',()=>{
      clearTimeout(hideTimer);
      if(submenu && main) submenu.style.top=main.getBoundingClientRect().top+'px';
      item.classList.add('open');
    });
    item.addEventListener('mouseleave',()=>{hideTimer=setTimeout(()=>item.classList.remove('open'),250);});
    function toggleAccordion(){
      const isOpen=item.classList.toggle('open');
      if(toggle) toggle.setAttribute('aria-expanded',isOpen?'true':'false');
    }
    if(toggle) toggle.addEventListener('click',toggleAccordion);
    if(main) main.addEventListener('click',e=>{
      if(isMobileMenu()){ e.preventDefault(); toggleAccordion(); }
      else closeOverlay();
    });
  });

  // ---- anno legale ----
  const footerYear=$('footerYear');
  if(footerYear) footerYear.textContent=new Date().getFullYear();

  if(!reduce){
    // ---- hero: reveal al caricamento (già in vista, non scroll-linked) ----
    const svcHero=$('svcHero');
    if(svcHero) requestAnimationFrame(()=>requestAnimationFrame(()=>svcHero.classList.add('revealed')));

    // ---- reveal-on-enter per sezioni e chiusura: un solo scatto quando entrano in viewport ----
    const revealTargets=[...document.querySelectorAll('.svcSection'),$('svcClose')];
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
    const svcHero=$('svcHero');
    if(svcHero) svcHero.classList.add('revealed');
    document.querySelectorAll('.svcSection').forEach(el=>el.classList.add('revealed'));
    if($('svcClose')) $('svcClose').classList.add('revealed');
  }
})();
