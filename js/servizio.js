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

  // ---- sidebar: "random ibrido-controllato" richiesto dal capo — ancora fissa in testata
  // (già in HTML) + selezione casuale dal pool condiviso per la colonna di destra, esclusa
  // l'ancora della pagina stessa (data-anchor). Pool volutamente limitato alle immagini con
  // alt/didascalia reali già forniti: le altre attendono metadata prima di entrare in rotazione.
  // Lazy loading nativo (loading="lazy"), non IntersectionObserver — più semplice, stesso risultato.
  const IMAGE_POOL=[
    {file:'manualistica-tecnica-40-impaginazione-layout-dtp.jpg',
      alt:'Layout grafico di un manuale tecnico 4.0 su monitor con illustrazioni vettoriali ed esplosi 3D a colori.'},
    {file:'redazione-manuali-istruzione-grafica-vettoriale.jpg',
      alt:'Postazione di lavoro DTP per l\'elaborazione di illustrazioni tecniche vettoriali per manuali d\'uso.'},
    {file:'packaging-industriale-istruzioni-grafica-tecnica.jpg',
      alt:'Istruzioni tecniche e simboli normati stampati sul packaging industriale di un prodotto.'},
    {file:'catalogo-ricambi-digitale-app-hyper-parts-smartphone.jpg',
      alt:'Tecnico in impianto che consulta il catalogo ricambi interattivo HYPER.PARTS da smartphone davanti al macchinario.'},
    {file:'modellazione-cad-3d-esplosi-ricambi-marketing-industriale.jpg',
      alt:'Progettista B2B al lavoro su doppio monitor con modelli CAD 3D e render esplosi per cataloghi e fiere.'},
    {file:'traduzioni-tecniche-post-editing-iso-18587-glossario.jpg',
      alt:'Dettaglio di un dizionario tecnico con schermo sullo sfondo che mostra l\'interfaccia di validazione traduzioni.'},
    {file:'gestionale-commesse-software-project-app.jpg',
      alt:'Interfaccia dell\'applicazione mobile 2.0 PROJECT con sezioni dedicate a glossari, tempo e gestione commesse.'},
    {file:'valutazione-rischi-direttiva-macchine-technical-compliance.jpg',
      alt:'Tecnico con elmetto protettivo in stabilimento operativo che utilizza un computer portatile per il Risk Assessment.'},
    {file:'analisi-rischi-sicurezza-impianti-marcatura-ce.jpg',
      alt:'Ingegneri e consulenti tecnici sul campo analizzano una matrice di Risk Assessment per la marcatura CE.'},
    {file:'soluzioni-software-custom-integrazione-gestionale-cad.jpg',
      alt:'Postazione con laptop, app mobile 2.0 PROJECT e documentazione stampata a dimostrazione dell\'integrazione dati.'}
  ];
  const svcSidebar=$('svcSidebar');
  if(svcSidebar){
    const anchorFile=svcSidebar.dataset.anchor;
    const pool=IMAGE_POOL.filter(img=>img.file!==anchorFile);
    for(let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
    pool.slice(0,5).forEach(img=>{
      const el=document.createElement('img');
      el.className='svcSidebarImg';
      el.loading='lazy';
      el.decoding='async';
      el.alt=img.alt;
      el.addEventListener('load',()=>el.classList.add('loaded'));
      el.src='img/services/gallery/'+img.file;
      svcSidebar.appendChild(el);
    });
  }

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
