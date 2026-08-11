(function(){
  const $=id=>document.getElementById(id);
  const scene=$('scene'),heroMove=$('heroMove'),tilt=$('tilt'),gloss=$('gloss'),menuBtn=$('menuBtn'),
        glossWrap=$('glossWrap'),triangle=$('triangle'),legend=$('legend'),hint=$('hint'),lightPanel=$('lightPanel'),
        chapter1=$('chapter1'),chBanner=$('chBanner'),card1b=$('card1b'),chSub=$('chSub'),ch1Img=$('ch1Img'),ch1ImgVeil=$('ch1ImgVeil'),
        chBlock=document.querySelector('.ch-block'),
        overlay=$('overlay'),closeBtn=$('closeBtn'),root=document.documentElement,body=document.body,
        preloader=$('preloader'),heroBadges=$('heroBadges');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lenisInstance=null;
  if(window.Lenis && !reduce){ lenisInstance=new Lenis({lerp:0.09,smoothWheel:true}); (function raf(t){lenisInstance.raf(t);requestAnimationFrame(raf);})(); }

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
  const chTitleEl=document.querySelector('.ch-title');
  const bt=chBanner.querySelector('.bt');
  const titleBase=document.querySelector('.title.base'), sheenEl=document.querySelector('.title.sheen');
  // ombra materica del titolo: pieno in hero, sfuma a zero entro la fine del docking (k=1 -> effetto pieno, k=0 -> nessuna ombra)
  const titleShadow=k=>[
    '0 1px 0 rgba(15,15,15,'+k.toFixed(3)+')','0 2px 0 rgba(13,13,13,'+k.toFixed(3)+')','0 3px 0 rgba(11,11,11,'+k.toFixed(3)+')',
    '0 4px 0 rgba(9,9,9,'+k.toFixed(3)+')','0 5px 0 rgba(7,7,7,'+k.toFixed(3)+')','0 8px 14px rgba(0,0,0,'+(0.78*k).toFixed(3)+')',
    '0 -1px 0 rgba(255,255,255,'+(0.20*k).toFixed(3)+')'].join(',');
  const cardHeadEl=card1b.querySelector('.c1b-head'), cardFootEl=card1b.querySelector('.c1b-foot'), cardTextEl=$('c1bText');
  // testo della card a BLOCCHI-FRASE (non parola per parola): stesso gesto "riga che si rivela" del titolo capitolo.
  // <br class="mobileBreak">: invisibile su desktop (dove il wrap naturale va bene, righe già equilibrate),
  // attivo solo sotto 820px — lì ogni frase lunga si spezzava dove capitava in base alla larghezza, non in un
  // punto scelto (2-3 righe irregolari a frase, sensazione di testo schiacciato). Qui il punto è deciso a mano,
  // in una pausa grammaticale naturale, così la frase si distende su righe più corte e pulite
  const phrases=["Da vent'anni affianchiamo l'industria manifatturiera B2B",
    "nell'intero ciclo di vita della documentazione tecnica<br class=\"mobileBreak\"> e dei contenuti multilingua.",
    'Metodologia, conformità normativa,<br class="mobileBreak"> un metodo di lavoro unico e software proprietari',
    'per trasformare i dati di progetto<br class="mobileBreak"> in documenti digitali chiari e innovativi,',
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

  let rect0={left:0,top:0}, l0Off=0, l1Off=0, l2Off=0, subRiseOffset=0;
  const DOCK={x:38,y:78,scale:.8};    // font grande, quasi metà viewport
  function measure(){
    heroMove.style.transform='none';
    rect0=heroMove.getBoundingClientRect();
    // quanto scende il blocco titolo+sottotitolo mentre il titolo è "da solo": l'altezza reale del
    // sottotitolo (che cambia con la larghezza dello schermo, quante righe fa) più lo spazio (gap)
    // che lo separa dal titolo — letto dal CSS invece di ripetere il valore a mano, per non doverlo
    // aggiornare in due posti se un giorno cambia
    if(chSub && chBlock){
      const gap=parseFloat(getComputedStyle(chBlock).rowGap)||0;
      subRiseOffset=chSub.offsetHeight+gap;
    }
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
    // riallineamento a sinistra delle righe corte (l0Off/l1Off): due finestre SFASATE, non più identiche.
    // Prima usavano lo stesso identico valore (alignDock): le due righe si muovevano sempre in perfetto
    // sincrono, leggibile come un blocco rigido che scatta, non come due parole che raggiungono ciascuna
    // il proprio bordo sinistro e si fermano. Qui "Technical" parte un po' dopo "DUE.ZERO" e ciascuna ha
    // la sua finestra di 7%, così arrivano in momenti leggermente diversi — moto più organico, non in blocco
    const alignDock0 = smooth(sub(s,.06,.13));
    const alignDock1 = smooth(sub(s,.09,.16));
    const shadowOut = 1-smooth(sub(s,.06,.14));  // ombra/gloss: timeline SEPARATA dal dock, sparisce nel primo terzo del docking
    const tiltFade  = 1-smooth(sub(s,.05,.22));  // dondolio si stabilizza PRIMA del pannello
    const panelRise = smooth(sub(s,.20,.42));    // pannello carta sale
    // hero sparisce PRIMA che la foto di sfondo (ch1Img, imgFadeIn .20-.30) diventi visibile: prima restava
    // visibile fino al 50% mentre la foto era già piena dal 30%, quindi per un lungo tratto si sovrapponevano
    // (scritta scura sopra la foto) — ora il fade finisce appena prima che la foto inizi ad apparire
    const heroOut   = 1-smooth(sub(s,.14,.19));
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
    glossWrap.style.setProperty('--l0Shift',(l0Off*alignDock0).toFixed(1)+'px');
    glossWrap.style.setProperty('--l1Shift',(l1Off*alignDock1).toFixed(1)+'px');
    glossWrap.style.setProperty('--l2Shift','0px');
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
    // partenza = metà esatta del massimo raggiungibile su QUESTO schermo (non più un fisso 65px):
    // prima il salto piccolo->grande arrivava fino a 4,6x su schermi larghi, e il triangolo iniziale
    // leggeva come troppo piccolo. Restando proporzionale al massimo, il rapporto è sempre 2x su ogni schermo
    const bgSide=Math.min(innerWidth*.28,innerHeight*.28,300), smSide=bgSide/2, barW=bannerBW;
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
    // il titolo entra "da solo": il blocco parte spostato in basso esattamente dell'altezza del
    // sottotitolo (spazio+gap, misurata in measure()), così il titolo occupa la posizione che
    // avrebbe se il sottotitolo non esistesse. Quando il sottotitolo comincia a rivelarsi (subIn,
    // stessa finestra) il blocco risale alla sua posizione naturale, liberando lo spazio sotto —
    // stessa tecnica già usata per il gruppo titolo+sottotitolo di 2.0 Project in Ecosistema
    if(chBlock) chBlock.style.transform='translateY('+((1-subIn)*subRiseOffset).toFixed(1)+'px)';
    // il titolo è più grande (1.12x) mentre è da solo, e torna alla sua dimensione normale (1x)
    // in sync con la risalita del blocco — stessa finestra (subIn), stesso principio di pjTitle in
    // Ecosistema (che cresce quando resta solo in scena). transform-origin:left bottom in CSS: cresce
    // verso l'alto restando ancorato a sinistra, non si sposta verso l'immagine né sopra il sottotitolo.
    // Solo sopra gli 820px: sotto quella soglia il corpo mobile del titolo è già tarato al millimetro
    // per stare su una riga sola (vedi commenti sul clamp mobile) — un ingrandimento in più lo faceva
    // uscire dal bordo destro dello schermo, tagliato in silenzio dall'overflow:hidden di .sticky
    // (nessuna barra di scroll a segnalarlo, verificato: 20px di testo invisibile a 375px)
    if(chTitleEl) chTitleEl.style.transform=innerWidth>820?('scale('+lerp(1.12,1,subIn).toFixed(3)+')'):'none';

    if(ch1Img){
      ch1Img.style.opacity=(imgFadeIn*(1-imgExit)).toFixed(3);
      if(ch1ImgVeil) ch1ImgVeil.style.opacity=(imgFadeIn*(1-imgExit)).toFixed(3);
      ch1Img.style.filter='blur('+(lerp(6,0,imgCrop)+lerp(0,8,imgExit)).toFixed(2)+'px)';
      // inquadratura scelta guardando la foto, non a caso: parte stretta sul telefono con l'app
      // "2.0 Project" (23%,63% — anche ponte narrativo verso l'Ecosistema, sezione successiva) e si
      // allarga fino a un'inquadratura MOLTO meno zoomata (130%->106%) e leggermente più in basso
      // (56%,40% -> 62%,48%): a 130% si vedeva solo lo schermo CAD, tagliando fuori sia il manuale
      // cartaceo (in basso a destra nella foto) sia lo schermo con il codice (in alto a destra) —
      // a 106% e con questo centro entrano entrambi nell'inquadratura, non solo il laptop centrale
      ch1Img.style.backgroundSize=lerp(300,106,imgCrop).toFixed(0)+'% auto';
      ch1Img.style.backgroundPosition=lerp(23,62,imgCrop).toFixed(1)+'% '+lerp(63,48,imgCrop).toFixed(1)+'%';
      // niente più -50% in Y: il box ora copre lo schermo intero via inset (come .ecoHyperImg), non
      // è più ancorato a top:50% — la Y torna 0, resta solo lo scivolamento orizzontale in ingresso/uscita
      ch1Img.style.transform='translate('+(lerp(10,0,imgCrop)+lerp(0,16,imgExit)).toFixed(2)+'vw,0) scale('+(lerp(.6,1,imgCrop)*lerp(1,1.25,imgExit)).toFixed(3)+')';
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

  const menuItems=overlay.querySelectorAll('.menuItem');
  function closeOverlay(){ overlay.classList.remove('open'); menuItems.forEach(mi=>mi.classList.remove('open')); }
  menuBtn.addEventListener('click',()=>overlay.classList.add('open'));
  closeBtn.addEventListener('click',closeOverlay);
  // .menuMain (Ecosistema 4.0/Servizi) è escluso qui apposta: su mobile non deve chiudere il menu/navigare
  // subito al tap, ha una gestione dedicata sotto (apre il sottomenu la prima volta)
  overlay.querySelectorAll('a:not(.menuMain)').forEach(a=>a.addEventListener('click',closeOverlay));
  addEventListener('keydown',e=>{if(e.key==='Escape')closeOverlay();});
  const isMobileMenu=()=>matchMedia('(max-width:820px)').matches;

  // sottomenu Ecosistema 4.0 / Servizi: desktop a lato con hover + piccolo ritardo alla chiusura (così
  // muovendosi in diagonale verso il pannello non si chiude prima di arrivarci); mobile ad accordion,
  // aperto/chiuso toccando la voce stessa (non solo il pulsante [+], troppo piccolo per notarlo —
  // prima il tocco sul testo navigava subito via, il sottomenu restava scoperto quasi sempre)
  menuItems.forEach(item=>{
    const toggle=item.querySelector('.menuToggle');
    const submenu=item.querySelector('.submenu');
    const main=item.querySelector('.menuMain');
    let hideTimer=null;
    item.addEventListener('mouseenter',()=>{
      clearTimeout(hideTimer);
      // il pannello è position:fixed ancorato a destra (vedi CSS): l'altezza esatta va allineata qui
      // alla voce sotto il mouse, altrimenti resterebbe sempre a top:0 qualunque voce si apra
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
      else closeOverlay();   // desktop: comportamento invariato, naviga e chiude il menu
    });
  });

  // effetto "dock" sui badge hero (stesso principio del dock di macOS): passando il mouse, l'icona sotto
  // il cursore si ingrandisce di più, le vicine di meno, in una curva che cala con la distanza — così lo
  // zoom "cade" da un'icona all'altra come un'unica onda continua invece di ogni icona che salta per conto
  // suo. Già pronto per quando le icone diventeranno 5: la curva si applica a quante ce ne sono, non c'è
  // un numero scritto a mano
  if(heroBadges && !reduce){
    // lo scale va sull'<img>, non su .heroBadge: la nuvoletta-tooltip è una sorella dell'immagine
    // (non sua figlia), quindi non si ingrandisce/deforma insieme all'icona sotto al mouse
    const badgeImgs=[...heroBadges.querySelectorAll('.heroBadge img')];
    const SIGMA=70;   // ampiezza dell'onda in px: quanto lontano si sente ancora l'ingrandimento del vicino
    const PEAK=.55;   // scale extra al centro (1 + PEAK = 1.55x sotto al cursore)
    heroBadges.addEventListener('mousemove',e=>{
      badgeImgs.forEach(img=>{
        const r=img.getBoundingClientRect(), cx=r.left+r.width/2;
        const d=e.clientX-cx;
        const s=1+PEAK*Math.exp(-(d*d)/(2*SIGMA*SIGMA));
        img.style.transform='scale('+s.toFixed(3)+')';
      });
    });
    heroBadges.addEventListener('mouseleave',()=>{ badgeImgs.forEach(img=>{ img.style.transform='scale(1)'; }); });
  }

  // "Documenti 4.0" salta subito al punto giusto, senza scorrere visibilmente attraverso tutto il
  // Capitolo 1 e mezzo Ecosistema per arrivarci (la destinazione è molto lontana dall'hero) — stesso
  // link, ma con Lenis in modalità "immediate" invece del suo scroll animato di default.
  // Lo scrollY salta in un frame, ma sP (qui) e sP2 (capitoli.js) sono smussati: senza risincronizzarli
  // subito, la scena "insegue" per 1-2s e si rivede tutta la coreografia in mezzo anche se lo scroll
  // è già arrivato — quindi dopo il salto forzo anche sP al valore reale e sincronizzo scene2
  const badgeDoc40=$('badgeDoc40');
  if(badgeDoc40) badgeDoc40.addEventListener('click',e=>{
    e.preventDefault();
    const target=document.getElementById('doc40Start');
    if(lenisInstance) lenisInstance.scrollTo(target,{immediate:true});
    else if(target) target.scrollIntoView();
    readScroll(); sP=pRaw; render(sP);
    if(window.__snapScene2Instant) window.__snapScene2Instant();
  });

  if(!reduce){
    let raf=null,px=0,py=0;
    addEventListener('mousemove',e=>{px=e.clientX;py=e.clientY;if(!raf)raf=requestAnimationFrame(()=>{onMove(px,py);raf=null;});});
    loop();
  }
  readScroll();
  window.addEventListener('load',measure); measure();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);   // ricalcola con i font caricati
})();
