(function(){
  const $=id=>document.getElementById(id);
  const scene=$('scene'),heroMove=$('heroMove'),tilt=$('tilt'),gloss=$('gloss'),testWall=$('testWall'),menuBtn=$('menuBtn'),
        glossWrap=$('glossWrap'),triangle=$('triangle'),legend=$('legend'),hint=$('hint'),
        chapter1=$('chapter1'),chBanner=$('chBanner'),card1b=$('card1b'),chSub=$('chSub'),ch1Img=$('ch1Img'),ch1ImgVeil=$('ch1ImgVeil'),
        overlay=$('overlay'),closeBtn=$('closeBtn'),root=document.documentElement,body=document.body,
        preloader=$('preloader'),heroBadges=$('heroBadges'),heroEco=$('heroEco');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lenisInstance=null;
  if(window.Lenis && !reduce){ lenisInstance=new Lenis({lerp:0.09,smoothWheel:true}); (function raf(t){lenisInstance.raf(t);requestAnimationFrame(raf);})(); }

  // ---- ritorno da una pagina interna (servizio, Parliamone, ...): se l'utente aveva lasciato la
  // home per una pagina nella stessa scheda, salviamo lo scroll esatto al momento del click (vedi
  // listener sotto) e lo ritroviamo qui al ritorno — niente preloader, si riparte dallo stesso punto
  // invece di rivedere l'apertura del sito da zero ----
  const RETURN_KEY='duezero_returnY';
  const returnYRaw=sessionStorage.getItem(RETURN_KEY);
  const isReturning=returnYRaw!==null;
  if(isReturning) sessionStorage.removeItem(RETURN_KEY);
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href$=".html"]:not([target="_blank"])');
    if(a) sessionStorage.setItem(RETURN_KEY,String(scrollY));
  });

  // ---- preloader: schermata nera/rossa coerente col resto del sito, sparisce quando font+pagina sono pronti.
  // Tempo minimo di visione (400ms) per evitare un flash su connessioni veloci. I due badge hero diventano
  // visibili solo DOPO questo momento (vedi preloadDone in render()). Il tempo minimo e l'animazione
  // della barra si saltano se isReturning: l'utente ha già visto l'apertura in questa sessione.
  let preloadDone=false;
  const preloaderBarFill=$('preloaderBarFill');
  // la riga rossa cresce verso un valore "quasi pieno" mentre si aspetta davvero il caricamento
  // (non finge un tempo fisso: se il caricamento è più lento, resta ferma li ad aspettare) —
  // solo al vero completamento scatta a 100%, si vede completarsi, POI la schermata dissolve sulla home
  if(preloaderBarFill && !isReturning){
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ preloaderBarFill.style.width='78%'; }));
  }
  function hidePreloader(){
    preloadDone=true;
    if(menuBtn) menuBtn.style.opacity='1';   // da qui in poi il menu resta acceso per tutto il documento
    if(preloader){
      if(isReturning){
        if(preloader.parentNode) preloader.parentNode.removeChild(preloader); // via di scatto, niente barra/dissolvenza
      } else {
        if(preloaderBarFill){ preloaderBarFill.style.transition='width .3s ease'; preloaderBarFill.style.width='100%'; }
        setTimeout(()=>{
          preloader.classList.add('done');   // la riga rossa si vede completare PRIMA che la schermata dissolva sulla home
          setTimeout(()=>{ if(preloader.parentNode) preloader.parentNode.removeChild(preloader); },650);
        },320);
      }
    }
    render(pRaw); // aggiorna subito la visibilità dei badge anche se reduce-motion non usa il loop continuo
  }
  const minDelay=isReturning?Promise.resolve():new Promise(r=>setTimeout(r,400));
  const fontsReady=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
  const pageReady=new Promise(r=>{ if(document.readyState==='complete') r(); else addEventListener('load',r,{once:true}); });
  Promise.all([minDelay,fontsReady,pageReady]).then(()=>{
    if(isReturning){
      // riposiziona PRIMA di togliere il preloader: nessun flash della cima pagina. scrollTo nativo
      // (verificato: Lenis non lo sovrascrive/corregge, a differenza di lenisInstance.scrollTo con un
      // numero puro, che qui restituiva un valore scalato/sbagliato). sP/sP2 sono smussati — stesso
      // principio del salto a Documenti 4.0 (badgeDoc40 sotto): senza risincronizzarli subito insieme
      // allo scrollY, la scena "insegue" per 1-2s e si rivede tutta la coreografia di mezzo anche se
      // lo scroll è già arrivato al punto giusto
      scrollTo(0,parseInt(returnYRaw,10)||0);
      readScroll(); sP=pRaw; render(sP);
      if(window.__snapScene2Instant) window.__snapScene2Instant();
    }
    hidePreloader();
  });

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
  // ogni voce dell'array è una riga (.ph è display:block, va a capo da sola) — gli a capo qui sono
  // esattamente quelli indicati dal capo (foto del testo), non affidati al wrap naturale del contenitore
  const phrases=["Siamo l'ufficio tecnico documentazione che affianca",
    "l'industria manifatturiera e il settore terziario B2B.",
    'Con il nostro ecosistema di servizi e il metodo 2.0 Project',
    "governiamo l'intero ciclo di vita dei contenuti tecnici.",
    'Metodologia, conformità normativa e software proprietari',
    'trasformano i dati di progetto in asset strategici digitali.',
    'Garantiamo efficienza operativa e rigorosa precisione',
    'in ogni singola fase della catena industriale.'];
  // 4 gruppi, uno per frase (2 righe ciascuno): spazio visibile e permanente dopo OGNI frase, non solo
  // tra le due coppie — la comparsa resta a coppie (vedi phLine), ma la separazione visiva è per frase
  const mkGroup=arr=>arr.map(t=>'<span class="ph"><i>'+t+'</i></span>').join(' ');
  // phGroupGap anche sul 1° gruppo (non solo dal 2° in poi): serve lo stesso spazio protettivo
  // sopra ciascun gruppo, altrimenti il primo (nessun gruppo precedente da coprire, ma comunque
  // soggetto allo zoom) sconfina nell'header non avendo margine sopra di sé
  cardTextEl.innerHTML=[0,2,4,6].map(start=>
    '<span class="phGroup phGroupGap">'+mkGroup(phrases.slice(start,start+2))+'</span>'
  ).join('');
  const phLines=[...cardTextEl.querySelectorAll('.ph i')];
  const phGroupEls=[...cardTextEl.querySelectorAll('.phGroup')];
  // allineamento fisso, non a ogni frame: i gruppi a sinistra (0,2) e quelli a destra (1,3) sono
  // tutti larghi quanto .c1b-text, quindi text-align:left/right (invece di center, ereditato da
  // .card1b) li fa partire/finire tutti sullo stesso identico bordo — non solo dentro al proprio
  // gruppo, ma allineati anche fra il primo e il terzo (o il secondo e il quarto)
  // i gruppi a destra (1,3) allineano la frase dal suo inizio (left), non dalla fine (right):
  // il blocco resta spostato a destra via translateX, ma il testo parte da un bordo comune invece
  // di finire su un bordo comune — quindi tutti e 4 i gruppi sono ora text-align:left
  phGroupEls.forEach(el=>{ el.style.textAlign='left'; });

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
  // true mentre il mouse è sopra un'icona hero: attenua la label sopra (vedi render) per liberare
  // spazio alla nuvoletta-tooltip senza doverle tenere lontane (che vanificherebbe il raggruppamento)
  let badgeHovered=false;
  function readScroll(){
    const denom=Math.max(1,scene.offsetHeight-innerHeight);
    pRaw=clamp((scrollY-scene.offsetTop)/denom,0,1);
  }

  function render(s){
    const reveal    = smooth(sub(s,0,.119));      // chrome intro (triangolo/menu/hint)
    const dock      = smooth(sub(s,.0451,.2235));    // titolo -> alto sx (il movimento dura fino alla fine, invariato)
    // riallineamento a sinistra delle righe corte (l0Off/l1Off): due finestre SFASATE, non più identiche.
    // Prima usavano lo stesso identico valore (alignDock): le due righe si muovevano sempre in perfetto
    // sincrono, leggibile come un blocco rigido che scatta, non come due parole che raggiungono ciascuna
    // il proprio bordo sinistro e si fermano. Qui "Technical" parte un po' dopo "DUE.ZERO" e ciascuna ha
    // la sua finestra di 7%, così arrivano in momenti leggermente diversi — moto più organico, non in blocco
    const alignDock0 = smooth(sub(s,.0451,.0975));
    const alignDock1 = smooth(sub(s,.0676,.119));
    const shadowOut = 1-smooth(sub(s,.0451,.1043));  // ombra/gloss: timeline SEPARATA dal dock, sparisce nel primo terzo del docking
    const tiltFade  = 1-smooth(sub(s,.0373,.1637));  // dondolio si stabilizza PRIMA del pannello
    // hero sparisce prima che il titolo del capitolo compaia
    const heroOut   = 1-smooth(sub(s,.1043,.1416));
    // triangolo->barra->banner->titolo: compresso a ~metà scroll rispetto a prima (era .149-.4252,
    // quasi 254vh quasi tutti neri con solo la formetta rossa in un angolo — sensazione di "quadrato
    // nero" durante lo scroll). Stessa sequenza, stesso easing, solo più veloce da percorrere; tutto
    // ciò che segue (immagine/sottotitolo/pausa/card) è poi traslato indietro della stessa quantità
    // risparmiata, cosi il loro ritmo relativo resta identico a prima
    const migrate   = smooth(sub(s,.149,.2019));    // ponte rosso: triangolo -> linea
    const fillBar   = smooth(sub(s,.1868,.2245));   // la linea diventa barra strutturale
    const btOp      = smooth(sub(s,.2245,.2472));   // label "Capitolo 1 — Chi siamo": subito prima del titolo
    // ---- apertura allineata al Capitolo 2: nero -> titolo da solo (centrato) -> immagine (già alla sua
    // inquadratura finale, solo dissolvenza) -> sottotitolo (titoletto + elenco, blocco unico) -> pausa
    // di lettura -> il pannello carta sale (nero->carta) mentre tutto il resto esce -> card editoriale ----
    const chOp      = smooth(sub(s,.2322,.2472));   // ch-title entra, in parallelo al label
    const chLine    = i=>smooth(sub(s,.2398+i*.0094,.2702+i*.0094));   // l'ultima riga completa l'entrata a ~.289
    const imgFadeIn = smooth(sub(s,.3078,.3688));   // immagine: solo dissolvenza, nessun crop/scale
    const subIn     = smooth(sub(s,.4178,.4668));   // sottotitolo: entra dopo l'immagine, in blocco unico
    // pausa di lettura reale (.4668-.5448) con titolo+immagine+sottotitolo tutti fermi e leggibili —
    // poi tutto esce insieme, lasciando il nero naturale della scena dietro alla card editoriale (che ha
    // già il proprio sfondo carta/bordo/ombra, identici a ecoBridge in apertura di Capitolo 2). Prima
    // saliva qui un pannello carta a schermo intero: creava un salto netto bianco->nero proprio
    // all'inizio del Capitolo 2, letto come un "quadrato bianco" che compariva dal nulla — rimosso
    const chapterOut= 1-smooth(sub(s,.5448,.5938));
    const imgExit   = smooth(sub(s,.5448,.5938));
    const cardIn    = smooth(sub(s,.5938,.7128));   // il pannello si apre nella card editoriale
    const cardHead  = smooth(sub(s,.6388,.6828));
    // 4 frasi, ognuna il proprio passo (non più a coppie): ogni frase (2 righe) compare per conto suo,
    // poi una pausa vera di solo scroll — vuoto, nulla di nuovo — prima che compaia la frase successiva,
    // cosi c'è il tempo di leggerla. REVEAL=.04 (le 2 righe della frase, stagger .005/durata .035 l'una),
    // PAUSE=.045 tra una frase e la successiva (3 pause), margine residuo finale ~.022 prima che la scena
    // prosegua — stesso principio della singola pausa tra coppie di prima, solo ripetuto per ogni frase
    const phLine    = i=>{
      const REVEAL=.04, PAUSE=.045, group=Math.floor(i/2), local=i%2;
      const g0=.6828+group*(REVEAL+PAUSE);
      return smooth(sub(s,g0+local*.005,g0+local*.005+.035));
    };

    // il menu non è più legato al progresso di questa scena: resta visibile su tutto il documento
    // (viene acceso una volta sola alla fine del preloader, vedi hidePreloader)
    hint.style.opacity=Math.max(0,1-reveal*2.5).toFixed(3);

    // badge hero: solo dopo il preload, spariscono all'inizio dello scroll (soglia leggermente più larga
    // di prima cosi non svaniscono nel giro di un singolo frame su uno scroll veloce)
    if(heroBadges){
      const badgesShown=preloadDone && s<.03;
      heroBadges.style.opacity=badgesShown?'1':'0';
      heroBadges.style.pointerEvents=badgesShown?'auto':'none'; // hover/click solo mentre sono davvero visibili
      if(heroEco) heroEco.style.opacity=badgesShown?(badgeHovered?'0.45':'1'):'0';
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
    // titolo un po' più grande finché è da solo, poi si restringe all'arrivo dell'immagine (sync con
    // imgFadeIn) fino al rapporto 9/9.5 = .9474 — la stessa dimensione di prima, già verificata. Solo
    // su desktop: su mobile il titolo ha già una sua size ridotta propria
    if(chTitleEl) chTitleEl.style.transform=(innerWidth<=820)?'none':'scale('+lerp(1,.9474,imgFadeIn).toFixed(4)+')';
    // sottotitolo (titoletto + elenco) come blocco unico, stessa maschera+scorrimento delle altre
    // righe del prototipo — entra tutto insieme, non voce per voce
    if(chSub) chSub.style.transform='translateY('+((1-subIn)*105).toFixed(1)+'%)';

    // immagine: solo dissolvenza, già alla sua inquadratura finale (fissata in CSS) — nessun
    // crop/scale/blur animato, come richiesto ("a tutta grandezza già")
    if(ch1Img){
      ch1Img.style.opacity=(imgFadeIn*(1-imgExit)).toFixed(3);
      if(ch1ImgVeil) ch1ImgVeil.style.opacity=(imgFadeIn*(1-imgExit)).toFixed(3);
    }

    // card editoriale: il pannello carta si apre nella card (scale morph, stesso gesto della palette)
    const cardW=card1b.offsetWidth||1, cardH=card1b.offsetHeight||1, side=cardH*0.26;
    const sx=lerp(side/cardW,1,cardIn), sy=lerp(0.26,1,cardIn);
    card1b.style.opacity=Math.min(1,cardIn*4).toFixed(3);
    card1b.style.transform='scale('+sx.toFixed(4)+','+sy.toFixed(4)+')';
    cardHeadEl.style.opacity=cardHead.toFixed(3); cardFootEl.style.opacity=cardHead.toFixed(3);
    phLines.forEach((el,i)=>{ const t=phLine(i); el.style.transform='translateY('+((1-t)*100).toFixed(1)+'%)'; });
    // ogni gruppo è spostato in modo FISSO in una posizione diversa (vedi GROUP_X, non toccare
    // più) e l'unico movimento è lo zoom: la frase si avvicina fisicamente allo schermo (vera
    // profondità 3D, non un semplice scale), poi torna indietro alla size normale.
    // perspective()+translateZ() invece di scale(): uno scale/scaleY piatto si percepisce
    // sempre come "un'animazione della dimensione", mentre una vera prospettiva (l'elemento che
    // si muove nello spazio verso la camera, con relativo foreshortening) si legge come uno
    // zoom reale. L'ingrandimento apparente risultante (perspective/(perspective-z)) è
    // volutamente nello stesso ordine di grandezza già verificato sicuro (~1.3x): lo spazio
    // fisico della card (76vh, gap tra le frasi, distanza da header/footer) è lo stesso vincolo
    // di prima e non è cambiato — cambia solo la qualità percepita del movimento, non quanto
    // spazio serve, quindi il margine di sicurezza già trovato resta valido
    const GROUP_REVEAL=.04, GROUP_PAUSE=.045, ZOOM_REVEAL=.06, PERSPECTIVE=900, Z_PEAK=210;
    const GROUP_X=[-70,70,-190,190]; // 1° un po' a sx, 2° un po' a dx, 3° molto più a sx (oltre -170), 4° di conseguenza a dx
    phGroupEls.forEach((el,g)=>{
      const g0=.6828+g*(GROUP_REVEAL+GROUP_PAUSE);
      const tZoom=smooth(sub(s,g0,g0+ZOOM_REVEAL));
      const z=lerp(Z_PEAK,0,tZoom); // si avvicina alla camera, poi torna alla profondità normale
      el.style.transformOrigin='center bottom';
      el.style.transform='perspective('+PERSPECTIVE+'px) translateZ('+z.toFixed(1)+'px) translateX('+GROUP_X[g]+'px)';
    });
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
    const gp=((lightX*0.6+lightY*0.4)*100).toFixed(1)+'%';
    gloss.style.setProperty('--gp',gp);
    if(testWall) testWall.style.setProperty('--gp',gp); // TEST: stessa banda di luce, riusata sul nuovo SVG

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
    // lo scale va sull'<svg>, non su .heroBadge: la pillola-tooltip è una sorella dell'icona
    // (non sua figlia), quindi non si ingrandisce/deforma insieme all'icona sotto al mouse
    const badgeImgs=[...heroBadges.querySelectorAll('.heroBadge svg')];
    // 1.25 sotto al cursore, ~1.15 sulla vicina immediata, ~1.03 su quella dopo ancora: onda che si
    // propaga su più icone (non solo la prima vicina) restando comunque sotto la soglia di sovrapposizione
    const SIGMA=60;   // ampiezza dell'onda in px: quanto lontano si sente ancora l'ingrandimento del vicino
    const PEAK=.25;   // scale extra al centro (1 + PEAK = 1.25x sotto al cursore)
    // target = dove dovrebbe stare la scala in base al mouse ORA; current = dove sta davvero, insegue
    // target con lo stesso smoothing via RAF usato altrove (tilt, scroll) — niente CSS transition:
    // quella si interrompe e riparte ad ogni mousemove (molto frequenti), da lì la sensazione meccanica
    const waveTarget=badgeImgs.map(()=>1), waveCurrent=badgeImgs.map(()=>1);
    heroBadges.addEventListener('mousemove',e=>{
      badgeImgs.forEach((img,i)=>{
        const r=img.getBoundingClientRect(), cx=r.left+r.width/2;
        const d=e.clientX-cx;
        waveTarget[i]=1+PEAK*Math.exp(-(d*d)/(2*SIGMA*SIGMA));
      });
    });
    heroBadges.addEventListener('mouseleave',()=>{ waveTarget.fill(1); });
    heroBadges.addEventListener('mouseenter',()=>{ badgeHovered=true; });
    heroBadges.addEventListener('mouseleave',()=>{ badgeHovered=false; });
    (function waveLoop(){
      badgeImgs.forEach((img,i)=>{
        waveCurrent[i]+=(waveTarget[i]-waveCurrent[i])*0.18;
        img.style.transform='scale('+waveCurrent[i].toFixed(3)+')';
      });
      requestAnimationFrame(waveLoop);
    })();
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
    if(window.__snapDoc40Instant) window.__snapDoc40Instant();
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
