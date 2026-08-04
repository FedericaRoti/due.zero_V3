(function(){
  const $=id=>document.getElementById(id);
  const scene=$('scene'),heroMove=$('heroMove'),tilt=$('tilt'),gloss=$('gloss'),menuBtn=$('menuBtn'),
        glossWrap=$('glossWrap'),triangle=$('triangle'),legend=$('legend'),hint=$('hint'),lightPanel=$('lightPanel'),
        chapter1=$('chapter1'),chBanner=$('chBanner'),card1b=$('card1b'),chSub=$('chSub'),ch1Img=$('ch1Img'),
        overlay=$('overlay'),closeBtn=$('closeBtn'),root=document.documentElement,body=document.body,
        preloader=$('preloader'),heroBadges=$('heroBadges');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(window.Lenis && !reduce){ const lenis=new Lenis({lerp:0.09,smoothWheel:true}); (function raf(t){lenis.raf(t);requestAnimationFrame(raf);})(); }

  // ---- preloader: schermata nera/rossa coerente col resto del sito, sparisce quando font+pagina sono pronti.
  // Tempo minimo di visione (400ms) per evitare un flash su connessioni veloci. I due badge hero diventano
  // visibili solo DOPO questo momento (vedi preloadDone in render()).
  let preloadDone=false;
  const preloaderBarFill=$('preloaderBarFill');
  // la riga rossa cresce verso un valore "quasi pieno" mentre si aspetta davvero il caricamento
  // (non finge un tempo fisso: se il caricamento è più lento, resta ferma li ad aspettare) —
  // solo al vero completamento scatta a 100%, si vede completarsi, POI la schermata dissolve sulla home
  if(preloaderBarFill){
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ preloaderBarFill.style.width='78%'; }));
  }
  function hidePreloader(){
    preloadDone=true;
    if(menuBtn) menuBtn.style.opacity='1';   // da qui in poi il menu resta acceso per tutto il documento
    if(preloader){
      if(preloaderBarFill){ preloaderBarFill.style.transition='width .3s ease'; preloaderBarFill.style.width='100%'; }
      setTimeout(()=>{
        preloader.classList.add('done');   // la riga rossa si vede completare PRIMA che la schermata dissolva sulla home
        setTimeout(()=>{ if(preloader.parentNode) preloader.parentNode.removeChild(preloader); },650);
      },320);
    }
    render(pRaw); // aggiorna subito la visibilità dei badge anche se reduce-motion non usa il loop continuo
  }
  const minDelay=new Promise(r=>setTimeout(r,400));
  const fontsReady=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
  const pageReady=new Promise(r=>{ if(document.readyState==='complete') r(); else addEventListener('load',r,{once:true}); });
  Promise.all([minDelay,fontsReady,pageReady]).then(hidePreloader);

  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)), sub=(p,a,b)=>clamp((p-a)/(b-a),0,1), smooth=t=>t*t*(3-2*t), lerp=(a,b,t)=>a+(b-a)*t;
  const chLines=[...document.querySelectorAll('.ch-title .ln i')];
  const bt=chBanner.querySelector('.bt');
  const titleBase=document.querySelector('.title.base'), sheenEl=document.querySelector('.title.sheen');
  // ombra materica del titolo: pieno in hero, sfuma a zero entro la fine del docking (k=1 -> effetto pieno, k=0 -> nessuna ombra)
  const titleShadow=k=>[
    '0 1px 0 rgba(15,15,15,'+k.toFixed(3)+')','0 2px 0 rgba(13,13,13,'+k.toFixed(3)+')','0 3px 0 rgba(11,11,11,'+k.toFixed(3)+')',
    '0 4px 0 rgba(9,9,9,'+k.toFixed(3)+')','0 5px 0 rgba(7,7,7,'+k.toFixed(3)+')','0 8px 14px rgba(0,0,0,'+(0.78*k).toFixed(3)+')',
    '0 -1px 0 rgba(255,255,255,'+(0.20*k).toFixed(3)+')'].join(',');
  const cardHeadEl=card1b.querySelector('.c1b-head'), cardFootEl=card1b.querySelector('.c1b-foot'), cardTextEl=$('c1bText');
  // testo della card a BLOCCHI-FRASE (non parola per parola): stesso gesto "riga che si rivela" del titolo capitolo
  const phrases=["Da vent'anni affianchiamo l'industria manifatturiera B2B",
    "nell'intero ciclo di vita della documentazione tecnica e dei contenuti multilingua.",
    'Metodologia, conformità normativa, un metodo di lavoro unico e software proprietari',
    'per trasformare i dati di progetto in documenti digitali chiari e innovativi,',
    'oggi asset strategici integrati nei processi aziendali.'];
  cardTextEl.innerHTML=phrases.map(t=>'<span class="ph"><i>'+t+'</i></span>').join(' ');
  const phLines=[...cardTextEl.querySelectorAll('.ph i')];

  let bannerLeft=0,bannerTop=0,bannerBW=660,bannerH=118;
  function buildBanner(){
    // laptop compatti (stessa soglia della media query del Capitolo 2): banner ridotto, non gigante.
    // Su telefono 43vw non basta a contenere il testo (nowrap) e la scritta usciva dal rettangolo:
    // stessa larghezza dei banner di Cap.02/03, definita nella media query (max-width:820px)
    const vw=innerWidth,vh=innerHeight, mobile=vw<=820, compact=(vw<=1280||vh<=820);
    const bw=mobile?Math.min(vw*0.86,420):(compact?Math.min(vw*0.43,460):Math.min(vw*0.5,660));
    bannerH=compact?Math.min(Math.max(64,vh*0.08),86):118; bannerBW=bw;
    // resta a destra (gli ALTRI banner, Cap.02/03/04/05, si sono allineati a questo lato — vedi CSS),
    // ma l'altezza (0.30vh, a metà schermo) era troppo bassa rispetto a dove stanno gli altri quattro
    // (9-11vh, in alto): alzato sugli stessi valori già in uso altrove
    bannerLeft=vw-(mobile?20:38)-bw; bannerTop=vh*(mobile?0.07:(compact?0.055:0.09));
    chBanner.style.left=bannerLeft+'px'; chBanner.style.top=bannerTop+'px';
    chBanner.style.width=bw+'px'; chBanner.style.height=bannerH+'px';
  }

  let rect0={left:0,top:0}, l0Off=0, l1Off=0, l2Off=0;
  const DOCK={x:38,y:78,scale:.8};    // font grande, quasi metà viewport
  function measure(){
    heroMove.style.transform='none';
    rect0=heroMove.getBoundingClientRect();
    // allineamento sinistro delle 3 righe una volta docked: ciascuna riga è centrata per conto proprio
    // (margin-inline:auto), quindi va spostata verso sinistra della metà della differenza rispetto alla
    // riga più larga delle tre — la riga più larga stessa non si sposta (offset 0), è lei a definire il
    // bordo sinistro comune. Generalizzazione dello schema a 2 righe già usato prima di aggiungere DUE.ZERO.
    const l0=document.querySelector('.title.base .l0'), l1=document.querySelector('.title.base .l1'),
          l2=document.querySelector('.title.base .l2');
    if(l0&&l1&&l2){
      const w0=l0.offsetWidth, w1=l1.offsetWidth, w2=l2.offsetWidth, maxW=Math.max(w0,w1,w2);
      l0Off=-(maxW-w0)/2; l1Off=-(maxW-w1)/2; l2Off=-(maxW-w2)/2;
    }
    buildBanner();
    if(reduce) render(pRaw);
  }

  // ---- dondolio (luce/ribaltamento hero — indipendente dallo scroll, si spegne via tiltK) ----
  let curRotX=0,curRotY=0,cursorTX=.5,cursorTY=.42,lightX=.5,lightY=.42,lastMove=-9999,tiltK=1;
  function onMove(cx,cy){
    root.style.setProperty('--mx',cx+'px');root.style.setProperty('--my',cy+'px');
    const r=gloss.getBoundingClientRect(),w=gloss.offsetWidth||1,h=gloss.offsetHeight||1;
    cursorTX=(cx-r.left)/w;cursorTY=(cy-r.top)/h; lastMove=performance.now();
  }

  // ---- UNA sola progressione di scroll + UNO smoothing, per tutte le micro-scene del Capitolo 1 ----
  let pRaw=0, sP=0;
  function readScroll(){
    const denom=Math.max(1,scene.offsetHeight-innerHeight);
    pRaw=clamp((scrollY-scene.offsetTop)/denom,0,1);
  }

  function render(s){
    const reveal    = smooth(sub(s,0,.16));      // chrome intro (triangolo/menu/hint)
    const dock      = smooth(sub(s,.06,.30));    // titolo -> alto sx (il movimento dura fino alla fine, invariato)
    const shadowOut = 1-smooth(sub(s,.06,.14));  // ombra/gloss: timeline SEPARATA dal dock, sparisce nel primo terzo del docking
    const tiltFade  = 1-smooth(sub(s,.05,.22));  // dondolio si stabilizza PRIMA del pannello
    const panelRise = smooth(sub(s,.20,.42));    // pannello carta sale
    const heroOut   = 1-smooth(sub(s,.32,.50));  // hero sparisce SOLO dopo che il dock è finito (niente più moto+dissolvenza insieme)
    const migrate   = smooth(sub(s,.20,.34));    // ponte rosso: triangolo -> linea, parte con la salita del pannello
    const fillBar   = smooth(sub(s,.30,.40));    // la linea diventa barra strutturale, finisce entro la salita del pannello
    const btOp      = smooth(sub(s,.40,.46));    // label "Capitolo 1 — Chi siamo": subito dopo la salita, niente vuoto
    const chOp      = smooth(sub(s,.42,.46));    // ch-title entra, in parallelo al label
    const chLine    = i=>smooth(sub(s,.44+i*.025,.52+i*.025));   // l'ultima riga completa l'entrata a ~.60
    const subIn     = smooth(sub(s,.60,.66));    // sottotitolo: entra appena il titolo ha finito, in blocco unico
    // le tappe successive sono spostate avanti di .02 rispetto a prima: il sottotitolo consuma parte
    // della pausa di lettura, e senza questo scarto resterebbe leggibile troppo poco
    const chapterOut= 1-smooth(sub(s,.74,.86));  // pausa di lettura completa (.66→.74) con titolo e sottotitolo fermi
    // immagine a destra: stessa tecnica di ecoProjectImg in Ecosistema (crop ravvicinato -> a fuoco).
    // Entra PRIMA del titolo (in parallelo alla salita del pannello carta, .20-.42), così il titolo
    // non arriva su una scena vuota; esce in sync con chapterOut, quando la card prende il posto
    const imgCrop   = smooth(sub(s,.20,.42));
    const imgFadeIn = smooth(sub(s,.20,.30));
    const imgExit   = smooth(sub(s,.74,.86));
    const cardIn    = smooth(sub(s,.72,.88));    // il pannello si apre nella card editoriale, sovrapposto a chapterOut
    const cardHead  = smooth(sub(s,.78,.84));
    // 5 frasi invece di 3 (testo più lungo): stagger più stretto (.02 invece di .03) perché
    // c'è più strada da coprire nella stessa finestra di scroll rimasta — verificato che
    // anche l'ultima frase completi l'entrata entro s=1.0, con un margine di lettura residuo
    const phLine    = i=>smooth(sub(s,.84+i*.02,.90+i*.02));

    // il menu non è più legato al progresso di questa scena: resta visibile su tutto il documento
    // (viene acceso una volta sola alla fine del preloader, vedi hidePreloader)
    hint.style.opacity=Math.max(0,1-reveal*2.5).toFixed(3);

    // badge hero: solo dopo il preload, spariscono all'inizio dello scroll (soglia leggermente più larga
    // di prima cosi non svaniscono nel giro di un singolo frame su uno scroll veloce)
    if(heroBadges){
      const badgesShown=preloadDone && s<.03;
      heroBadges.style.opacity=badgesShown?'1':'0';
      heroBadges.style.pointerEvents=badgesShown?'auto':'none'; // hover/click solo mentre sono davvero visibili
    }

    // hero: dock + fade sincronizzato col pannello (non più su una timeline separata)
    const sc=1-(1-DOCK.scale)*dock, tx=(DOCK.x-rect0.left)*dock, ty=(DOCK.y-rect0.top)*dock;
    heroMove.style.transform='translate('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px) scale('+sc.toFixed(4)+')';
    glossWrap.style.setProperty('--l0Shift',(l0Off*dock).toFixed(1)+'px');
    glossWrap.style.setProperty('--l1Shift',(l1Off*dock).toFixed(1)+'px');
    glossWrap.style.setProperty('--l2Shift',(l2Off*dock).toFixed(1)+'px');
    heroMove.style.opacity=heroOut.toFixed(3);
    tiltK=tiltFade;
    gloss.style.opacity=shadowOut.toFixed(3);   // riflesso e drop-shadow: spariscono nel primo terzo del docking, non insieme al movimento
    titleBase.style.textShadow=titleShadow(shadowOut);   // idem per l'ombra materica: quando il titolo è chiaramente in moto, niente ombra dietro
    sheenEl.style.opacity=shadowOut.toFixed(3);   // il terzo livello (luce statica) si spegne insieme: senza, il testo scuro sotto resterebbe a due toni e leggerebbe come un'ombra
    const tr=Math.round(lerp(237,47,shadowOut)), tg=Math.round(lerp(237,47,shadowOut)), tb=Math.round(lerp(234,47,shadowOut));
    titleBase.style.color='rgb('+tr+','+tg+','+tb+')';   // il colore stesso passa da grigio-rilievo a un piatto chiaro leggibile: nessun effetto di superficie residuo

    legend.style.opacity=(Math.min(1,reveal)*heroOut).toFixed(3);
    legend.style.transform='scale('+(1+dock*0.18).toFixed(3)+')';

    lightPanel.style.transform='translateY('+((1-panelRise)*101).toFixed(2)+'%)';
    body.classList.toggle('light', panelRise>.4);

    // triangolo -> linea -> barra: un solo elemento DOM, un solo gesto continuo (clip-path morph)
    // triangolo rettangolo isoscele (45°/45°/90°) sia piccolo che ingrandito: un solo lato condiviso da
    // larghezza e altezza, non due formule separate — smette di essere un triangolo solo quando comincia
    // davvero a migrare verso la barra (migrate>0), fase in cui il morph in linea/barra è voluto
    const smSide=65, bgSide=Math.min(innerWidth*.28,innerHeight*.28,300), barW=bannerBW;
    const grow=lerp(smSide,bgSide,reveal);
    const curW=lerp(grow,barW,migrate);
    const curH=lerp(lerp(grow,3,migrate),bannerH,fillBar);
    const curLeft=lerp(innerWidth-curW,bannerLeft,migrate);
    const curTop=lerp(innerHeight-curH,bannerTop+bannerH/2-curH/2,migrate);
    triangle.style.left=curLeft.toFixed(1)+'px'; triangle.style.top=curTop.toFixed(1)+'px';
    triangle.style.width=curW.toFixed(1)+'px'; triangle.style.height=curH.toFixed(1)+'px';
    // angolo in basso a destra tagliato a 45°, come il lembo di una pagina che si sfoglia. Cresce con
    // fillBar (cioè mentre la linea diventa barra piena): finché è una linea alta 3px un angolo tagliato
    // non si leggerebbe, e il triangolo iniziale resta intatto. Il taglio è in pixel e viene riconvertito
    // in percentuali sui due assi, altrimenti su un rettangolo largo e basso i 45° non sarebbero tali.
    const cutPx=lerp(0,Math.min(curH*0.42,44),fillBar);
    const cutX=(cutPx/Math.max(curW,1))*100, cutY=(cutPx/Math.max(curH,1))*100;
    triangle.style.clipPath='polygon(100% 0%,100% '+(100-cutY).toFixed(2)+'%,'+(100-cutX).toFixed(2)+'% 100%,0% 100%,'+lerp(100,0,migrate).toFixed(2)+'% 0%)';
    triangle.style.opacity=chapterOut.toFixed(3);

    chBanner.style.opacity=(Math.min(1,btOp*3)*chapterOut).toFixed(3);
    bt.style.opacity=(btOp*chapterOut).toFixed(3);

    chapter1.style.opacity=(chOp*chapterOut).toFixed(3);
    chLines.forEach((el,i)=>{ const wp=chLine(i); el.style.transform='translateY('+((1-wp)*106).toFixed(1)+'%)'; });
    if(chSub) chSub.style.transform='translateY('+((1-subIn)*105).toFixed(1)+'%)';

    if(ch1Img){
      ch1Img.style.opacity=(imgFadeIn*(1-imgExit)).toFixed(3);
      ch1Img.style.filter='blur('+(lerp(6,0,imgCrop)+lerp(0,8,imgExit)).toFixed(2)+'px)';
      // inquadratura scelta guardando la foto, non a caso: parte stretta sul telefono con l'app
      // "2.0 Project" (23%,63% — anche ponte narrativo verso l'Ecosistema, sezione successiva) e si
      // allarga fino allo schermo con il disegno tecnico esploso della macchina (56%,40%), il soggetto
      // più coerente con "documentazione tecnica" di tutta la foto
      ch1Img.style.backgroundSize=lerp(300,130,imgCrop).toFixed(0)+'% auto';
      ch1Img.style.backgroundPosition=lerp(23,56,imgCrop).toFixed(1)+'% '+lerp(63,40,imgCrop).toFixed(1)+'%';
      // niente più -50% in Y: prima serviva a ricentrare un pannello alto 78vh ancorato a top:50%,
      // ora il pannello è già a piena altezza (top:0, height:100%), l'unico movimento è orizzontale
      ch1Img.style.transform='translateX('+(lerp(10,0,imgCrop)+lerp(0,16,imgExit)).toFixed(2)+'vw) scale('+(lerp(.6,1,imgCrop)*lerp(1,1.25,imgExit)).toFixed(3)+')';
    }

    // card editoriale: il pannello carta si apre nella card (scale morph, stesso gesto della palette)
    const cardW=card1b.offsetWidth||1, cardH=card1b.offsetHeight||1, side=cardH*0.26;
    const sx=lerp(side/cardW,1,cardIn), sy=lerp(0.26,1,cardIn);
    card1b.style.opacity=Math.min(1,cardIn*4).toFixed(3);
    card1b.style.transform='scale('+sx.toFixed(4)+','+sy.toFixed(4)+')';
    cardHeadEl.style.opacity=cardHead.toFixed(3); cardFootEl.style.opacity=cardHead.toFixed(3);
    phLines.forEach((el,i)=>{ const t=phLine(i); el.style.transform='translateY('+((1-t)*100).toFixed(1)+'%)'; });
  }

  function loop(now){
    now=now||performance.now();const t=now/1000;
    // RIBALTAMENTO coerente: una sola fase guida inclinazione + luce (sempre attivo, finché tiltK>0)
    const ph=(Math.sin(t*.4)+1)/2;
    const rotY=(ph-.5)*2*9, rotX=Math.sin(t*.4+1.2)*-5;
    const tLX=.12+ph*.52, tLY=.24+ph*.5;
    if(tiltK<.01){curRotX=0;curRotY=0;} else {curRotX+=(rotX*tiltK-curRotX)*.09; curRotY+=(rotY*tiltK-curRotY)*.09;}   // azzeramento netto, non solo asintotico: niente residuo di rotazione 3D sul titolo agganciato
    lightX+=(tLX-lightX)*.05; lightY+=(tLY-lightY)*.05;
    tilt.style.transform='rotateX('+curRotX.toFixed(3)+'deg) rotateY('+curRotY.toFixed(3)+'deg)';
    // banda obliqua: stessa oscillazione automatica di prima (lightX/lightY, dondolio a tempo), solo
    // ricondotta a UN valore solo (--gp) perché un linear-gradient ha una posizione, non un centro x/y
    gloss.style.setProperty('--gp',((lightX*0.6+lightY*0.4)*100).toFixed(1)+'%');

    sP+=(pRaw-sP)*0.07;   // UNICO smoothing per tutta la coreografia del Capitolo 1
    render(sP);
    requestAnimationFrame(loop);
  }

  let badgesPulsed=false;
  addEventListener('scroll',()=>{
    readScroll();
    // primo scroll reale: i badge stanno per sparire, quindi fanno un piccolo "pop" per farsi notare
    // anche da chi scrolla veloce, invece di svanire silenziosamente (una sola volta)
    if(!badgesPulsed && preloadDone && pRaw>0 && heroBadges){
      badgesPulsed=true;
      heroBadges.classList.add('pulseOut');
      setTimeout(()=>heroBadges.classList.remove('pulseOut'),700);
    }
    if(reduce) render(pRaw);
  },{passive:true});
  addEventListener('resize',measure);

  menuBtn.addEventListener('click',()=>overlay.classList.add('open'));
  closeBtn.addEventListener('click',()=>overlay.classList.remove('open'));
  overlay.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>overlay.classList.remove('open')));
  addEventListener('keydown',e=>{if(e.key==='Escape')overlay.classList.remove('open');});

  if(!reduce){
    let raf=null,px=0,py=0;
    addEventListener('mousemove',e=>{px=e.clientX;py=e.clientY;if(!raf)raf=requestAnimationFrame(()=>{onMove(px,py);raf=null;});});
    loop();
  }
  readScroll();
  window.addEventListener('load',measure); measure();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);   // ricalcola con i font caricati
})();
