(function(){
  const $=id=>document.getElementById(id);
  const scene2=$('scene2'); if(!scene2) return;
  const bgHyper=$('bgHyper'),
        ecoBridge=$('ecoBridge'), ch2Banner=$('ch2Banner'), ch2BannerBar=$('ch2BannerBar'), ch2BannerText=$('ch2BannerText'),
        ecoOpenH=$('ecoOpenH'), ecoOpenSub=$('ecoOpenSub'),
        ecoProjectImg=$('ecoProjectImg'), ecoProjectVeil=$('ecoProjectVeil'), pjGroup=$('pjGroup'), pjTitle=$('pjTitle'), pjSub=$('pjSub'), pjDesc=$('pjDesc'), pjCtaRow=$('pjCtaRow'),
        hpGroup=$('hpGroup'), hpTitle=$('hpTitle'), hpSub=$('hpSub'), hpDesc=$('hpDesc'), hpCtaRow=$('hpCtaRow'), ecoHyperImg=$('ecoHyperImg'),
        ecoLabQImg=$('ecoLabQImg'), lqGroup=$('lqGroup'), lqTitle=$('lqTitle'), lqSub=$('lqSub'), lqDesc=$('lqDesc'), lqCtaRow=$('lqCtaRow'),
        dcTitle=$('dcTitle'), dcAccent=$('dcAccent'), dcSub=$('dcSub'), dcPara=$('dcPara'), dcHint=$('dcHint');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)), sub=(p,a,b)=>clamp((p-a)/(b-a),0,1), smooth=t=>t*t*(3-2*t), lerp=(a,b,t)=>a+(b-a)*t;

  if(!reduce){
    // ---- UNA sola progressione di scroll + UNO smoothing per tutto il Capitolo 2 ----
    let pRaw2=0, sP2=0;
    function readScroll2(){ const denom=Math.max(1,scene2.offsetHeight-innerHeight); pRaw2=clamp((scrollY-scene2.offsetTop)/denom,0,1); }

    function render2(s){
      // ---- Ponte, Ecosistema, Project 2.0, Hyperparts: TUTTE le soglie sotto restano quelle originali,
      // invariate — usano "sOld", non "s" direttamente. sOld rimappa la prima parte (650vh reali, esattamente
      // come prima di aggiungere Hyper.LabQ) sull'intervallo [0,1], satura a 1 oltre — così Hyper.LabQ può
      // essere aggiunta in coda (serve più scroll totale per contenerla) senza ricalcolare una sola soglia
      // di questo blocco: k = quota della vecchia timeline (650vh) sul nuovo totale (1050vh) ----
      const k = 650/1050;
      const sOld = Math.min(s/k, 1);

      // ---- Ponte Cap.1 -> Cap.2 [0,.144]: il perimetro della card si espande MENTRE il campo carta
      // diventa nero, stessa finestra (prima erano in sequenza: espande 0-.072, poi annerisce .072-.144 —
      // a metà ponte lo schermo era già pieno ma ancora tutto bianco). Sovrapposte, non è mai né grande
      // né chiara insieme. In più: lo sticky del Capitolo 1 si sblocca nativamente nelle ultime 100vh del
      // suo scroll (la card "sale" fuori campo) — in quella finestra sticky2/ecoBridge sbirciano già dal
      // basso nella loro posizione naturale, PRIMA che "s" (legato all'inizio della Scena 2) inizi a
      // muoversi: restavano bianchi e fermi per tutta quella finestra, il vero "quadrato bianco" segnalato.
      // preBridge segue lo scroll reale (non smussato, come lo svincolo nativo stesso) e anticipa lì
      // l'espansione/annerimento, così la card sta già scurendosi mentre sbircia dal basso ----
      const preBridge = smooth(clamp((scrollY-(scene2.offsetTop-innerHeight))/innerHeight,0,1));
      const bridgeExpand = Math.max(preBridge, smooth(sub(sOld,0,.144)));
      const bridgeBlacken = Math.max(preBridge, smooth(sub(sOld,0,.144)));
      ecoBridge.style.top=lerp(12,0,bridgeExpand).toFixed(2)+'vh';
      ecoBridge.style.left=lerp(6,0,bridgeExpand).toFixed(2)+'vw';
      ecoBridge.style.right=lerp(6,0,bridgeExpand).toFixed(2)+'vw';
      ecoBridge.style.height=lerp(76,100,bridgeExpand).toFixed(2)+'vh';
      ecoBridge.style.borderColor='rgba(20,20,18,'+(0.12*(1-bridgeExpand)).toFixed(3)+')';
      ecoBridge.style.boxShadow='0 6px 18px rgba(0,0,0,'+(0.08*(1-bridgeExpand)).toFixed(3)+')';
      const brR=Math.round(lerp(237,10,bridgeBlacken)), brG=Math.round(lerp(237,10,bridgeBlacken)), brB=Math.round(lerp(234,10,bridgeBlacken));
      ecoBridge.style.background='rgb('+brR+','+brG+','+brB+')';

      // ---- Apertura Ecosistema [0,.19]: banner di capitolo (linea -> barra piena -> testo) -> titolo
      // da solo, centrato -> hold -> il titolo si rimpicciolisce (resta visibile, come l'apertura del
      // Capitolo 1) -> l'elenco puntato entra sotto -> hold reale (4 punti da leggere, coerenza col
      // Capitolo 1 richiesta esplicitamente — qui niente immagine, quindi si resta su nero pieno) ----
      const lineGrow     = smooth(sub(sOld,0,.012));  // linea rossa sottile che si estende in larghezza
      const barFill      = smooth(sub(sOld,.009,.024));  // la linea si ispessisce in barra piena (stessa logica del Capitolo 1)
      const bannerTextIn = smooth(sub(sOld,.020,.036));  // testo mono, entra a barra quasi completata
      const headIn  = smooth(sub(sOld,.016,.072));   // scala + opacity soltanto: MAI split text, MAI translateY dal basso, MAI stagger
      // hold da solo [.072,.086]: nessuna variabile, il titolo resta fermo e leggibile
      const titleShrink = smooth(sub(sOld,.086,.108));  // il titolo si rimpicciolisce (scale, non fade): resta
                                                        // visibile in alto, esattamente come il titolo del Capitolo 1
                                                        // quando arriva l'immagine — qui non c'è immagine, ma la
                                                        // logica "il titolo lascia spazio restando leggibile" è la stessa
      const subIn    = smooth(sub(sOld,.104,.140));  // l'elenco entra sotto, leggera sovrapposizione con lo shrink
      // hold finale [.140,.19]: molto più lungo del semplice ingresso — 4 punti elenco da leggere,
      // deve restare fermo prima che inizi il ritiro verso 2.0 Project (altrimenti si legge solo
      // metà elenco e la scena successiva sembra già sovrapposta)

      // ---- Ponte verso 2.0 PROJECT [.19,.28]: titolo+elenco si ritirano con crop/maschera, emerge l'immagine ----
      const retreat = smooth(sub(sOld,.19,.28));    // gesto dominante: clip-path, non un fade
      ch2Banner.style.opacity=(1-retreat).toFixed(3);
      ch2BannerBar.style.width=(lineGrow*100).toFixed(1)+'%';
      ch2BannerBar.style.height=lerp(3,100,barFill).toFixed(1)+'%';
      ch2BannerText.style.opacity=bannerTextIn.toFixed(3);
      ch2BannerText.style.transform='translateY('+((1-bannerTextIn)*8).toFixed(1)+'px)';
      ecoOpenH.style.opacity=(headIn*(1-retreat)).toFixed(3);
      ecoOpenH.style.transform='scale('+(lerp(1.06,1,headIn)*lerp(1,.9474,titleShrink)).toFixed(3)+')';
      ecoOpenH.style.clipPath='inset(0 '+(retreat*100).toFixed(1)+'% 0 0)';
      ecoOpenSub.style.opacity=(subIn*(1-retreat)).toFixed(3);
      ecoOpenSub.style.maxHeight=lerp(0,400,subIn).toFixed(0)+'px';

      const imgFadeIn = smooth(sub(sOld,.19,.22)); // opacity solo come supporto rapido, il resto è leggibile senza
      const cropOut   = retreat;                  // stessa progressione della headline: il crop del testo genera l'entrata dell'immagine

      // ---- primo frame di 2.0 PROJECT, 5 stati distinti ----
      // A. entrata (titolo -> sottotitolo) + hold leggibile [.191,.258]
      const titleIn  = smooth(sub(sOld,.255,.280));   // il titolo entra quando l'immagine è già leggibile
      const subInPj  = smooth(sub(sOld,.278,.300));   // sottotitolo, leggera coda sul titolo
      // hold leggibile [.300,.322]: nessuna variabile qui, il gruppo resta fermo e leggibile
      // B. riallineamento [.322,.352]: il gruppo titolo+sottotitolo sale, un solo gesto continuo legato allo scroll;
      //    la scritta "2.0 PROJECT" aumenta di dimensione in vista della seconda parte (descrizione + CTA)
      const regroup   = smooth(sub(sOld,.322,.352));
      const titleGrow = smooth(sub(sOld,.322,.354));  // risolto esattamente quando entra la descrizione
      // C. descrizione [.354,.372] e CTA [.382,.402], solo dopo il riallineamento, con pausa breve fra le due
      const descIn   = smooth(sub(sOld,.354,.372));
      const ctaIn    = smooth(sub(sOld,.382,.402));
      // hold reale della CTA [.402,.447] (~0.045): frame Project stabile e cliccabile, poi uscita di scena
      const projectOut = smooth(sub(sOld,.447,.461));

      const pjImgExit = smooth(sub(sOld,.461,.495));  // dopo l'hold della CTA: il campo Project si espande e perde fuoco, non una dissolvenza
      ecoProjectImg.style.opacity=(imgFadeIn*(1-pjImgExit)).toFixed(3);
      if(ecoProjectVeil) ecoProjectVeil.style.opacity=(imgFadeIn*(1-pjImgExit)).toFixed(3);
      ecoProjectImg.style.filter='blur('+(lerp(5,0,cropOut)+lerp(0,10,pjImgExit)).toFixed(2)+'px)';
      ecoProjectImg.style.backgroundSize=lerp(340,130,cropOut).toFixed(0)+'% auto';
      ecoProjectImg.style.backgroundPosition=lerp(44,46,cropOut).toFixed(1)+'% '+lerp(22,40,cropOut).toFixed(1)+'%';
      // niente più -50% in Y: il box copre lo schermo intero via inset (come .ecoHyperImg)
      ecoProjectImg.style.transform='translate('+(lerp(14,0,cropOut)+lerp(0,22,pjImgExit)).toFixed(2)+'vw,0) scale('+(lerp(.55,1,cropOut)*lerp(1,1.35,pjImgExit)).toFixed(3)+')';

      pjGroup.style.opacity=(1-projectOut).toFixed(3);
      pjGroup.style.transform='translateY(-'+lerp(0,6,regroup).toFixed(2)+'vh)';  // dimezzato (12->6vh): lo spazio percepito verso la descrizione era troppo largo
      pjTitle.style.opacity=titleIn.toFixed(3);
      pjTitle.style.transform='translateY('+((1-titleIn)*18).toFixed(1)+'px) scale('+lerp(1,1.2,titleGrow).toFixed(3)+')';
      pjSub.style.opacity=subInPj.toFixed(3);
      pjDesc.style.opacity=(descIn*(1-projectOut)).toFixed(3);
      pjDesc.style.transform='translateY('+((1-descIn)*10).toFixed(1)+'px)';
      pjCtaRow.style.opacity=(ctaIn*(1-projectOut)).toFixed(3);
      pjCtaRow.style.pointerEvents=(ctaIn>.6 && projectOut<.5)?'auto':'none';

      // ---- fondo Hyperparts/Hyper.LabQ — resta scuro fino alla fine della scena (Documentation 4.0,
      // che segue, è una scena indipendente propria e gestisce il proprio fondo carta) ----
      const cGroup = smooth(sub(sOld,.465,.535));
      bgHyper.style.opacity=cGroup.toFixed(3);

      // ---- Transizione Project -> Hyperparts [.461,.555]: da un accesso individuale a un tavolo di lavoro condiviso ----
      const hpImgFadeIn = smooth(sub(sOld,.467,.501));  // crossfade fra le due immagini, sovrapposto al gesto di pjImgExit
      const hpZoomOut   = smooth(sub(sOld,.461,.555));  // crop ravvicinato e sfocato sul monitor -> arretra fino a tavolo/persone/schermo

      // ---- HYPERPARTS: titolo dominante (parola intera via maschera laterale) -> sottotitolo attaccato subito
      // dopo (come in 2.0 Project: stagger stretto, non più un hold-poi-restringi-poi-entra separato) ->
      // hold insieme -> descrizione -> pausa -> CTA -> hold reale ----
      const hpTitleWipe  = smooth(sub(sOld,.530,.580));
      const hpSubIn      = smooth(sub(sOld,.576,.601));  // parte quando il titolo è quasi rivelato, come subInPj su titleIn
      // hold titolo+sottotitolo insieme [.601,.625]
      const hpRegroup    = smooth(sub(sOld,.625,.650));  // il gruppo sale un poco, stesso gesto/stessa misura (6vh) di
                                                        // pjGroup in Project — prima mancava, la descrizione arrivava
                                                        // attaccata subito sotto senza nessuno spazio percepibile
      const hpDescIn     = smooth(sub(sOld,.663,.681));
      // pausa breve [.681,.693]
      const hpCtaIn      = smooth(sub(sOld,.693,.713));
      // hold reale della CTA [.713,.744]: CTA e titolo restano fermi e cliccabili

      // ---- uscita testo di Hyperparts, solo quando inizia il crossfade verso Hyper.LabQ ----
      const hpOut = smooth(sub(sOld,.744,.785));
      hpGroup.style.transform='translateY(-'+lerp(0,6,hpRegroup).toFixed(2)+'vh)';
      hpTitle.style.opacity=(hpTitleWipe*(1-hpOut)).toFixed(3);
      hpTitle.style.clipPath='inset(0 '+((1-hpTitleWipe)*100).toFixed(1)+'% 0 0)';
      hpTitle.style.transform='scale('+lerp(1.05,1,hpTitleWipe).toFixed(3)+')';
      hpSub.style.opacity=(hpSubIn*(1-hpOut)).toFixed(3);
      hpSub.style.transform='translateX('+((1-hpSubIn)*-10).toFixed(1)+'px)';
      hpDesc.style.opacity=(hpDescIn*(1-hpOut)).toFixed(3);
      hpDesc.style.transform='translateY('+((1-hpDescIn)*10).toFixed(1)+'px)';
      hpCtaRow.style.opacity=(hpCtaIn*(1-hpOut)).toFixed(3);
      hpCtaRow.style.pointerEvents=(hpCtaIn>.6 && hpOut<.5)?'auto':'none';

      // ==== HYPER.LABQ — da qui in poi si usa "s" (raw), non più "sOld": è territorio nuovo, oltre la
      // vecchia timeline. Stesso identico meccanismo di crossfade di Project -> Hyperparts qui sopra
      // (hpImgFadeIn/pjImgExit): la foto di Hyperparts sfuma mentre quella di Hyper.LabQ è GIÀ visibile,
      // stesso sticky, nessun buco nero fra le due — risolve esattamente quello che due sticky
      // indipendenti non potevano fare (una foto non "sbircia" mentre l'altra è ancora in scena) ====
      const hpPhotoExit = smooth(sub(s,.605,.635));   // Hyperparts: la foto esce
      const lqPhotoIn   = smooth(sub(s,.610,.640));   // Hyper.LabQ: la foto entra, quasi sovrapposta
      const lqZoomIn    = smooth(sub(s,.605,.660));   // stesso assestamento scala/sfocatura di hpZoomOut

      ecoHyperImg.style.opacity=(hpImgFadeIn*(1-hpPhotoExit)).toFixed(3);
      ecoHyperImg.style.filter='blur('+lerp(0,14,hpPhotoExit).toFixed(2)+'px)';
      ecoHyperImg.style.transform='scale('+lerp(1,1.18,hpPhotoExit).toFixed(3)+')';

      // ecoLabQImg (opacity/filter/transform/clip-path) è impostato una sola volta più sotto, dove si
      // gestisce anche l'uscita verso Documentation 4.0 — stessa formula "ingresso*(1-uscita)" di
      // ecoHyperImg qui sopra, non serve scriverla due volte

      // titolo dominante -> sottotitolo -> hold -> riallineamento -> descrizione -> CTA -> hold reale:
      // stessa identica grammatica di Hyperparts, solo appesa in coda alla stessa timeline (s raw)
      const lqTitleWipe = smooth(sub(s,.660,.705));
      const lqSubIn     = smooth(sub(s,.701,.723));
      // hold titolo+sottotitolo insieme [.723,.744]
      const lqRegroup   = smooth(sub(s,.744,.766));
      const lqDescIn    = smooth(sub(s,.778,.794));
      const lqCtaIn     = smooth(sub(s,.805,.823));
      // hold reale della CTA [.823,.850]: CTA e titolo restano fermi e cliccabili

      const lqOut = smooth(sub(s,.850,.887));
      lqGroup.style.transform='translateY(-'+lerp(0,6,lqRegroup).toFixed(2)+'vh)';
      lqTitle.style.opacity=(lqTitleWipe*(1-lqOut)).toFixed(3);
      lqTitle.style.clipPath='inset(0 '+((1-lqTitleWipe)*100).toFixed(1)+'% 0 0)';
      lqTitle.style.transform='scale('+lerp(1.05,1,lqTitleWipe).toFixed(3)+')';
      lqSub.style.opacity=(lqSubIn*(1-lqOut)).toFixed(3);
      lqSub.style.transform='translateX('+((1-lqSubIn)*-10).toFixed(1)+'px)';
      lqDesc.style.opacity=(lqDescIn*(1-lqOut)).toFixed(3);
      lqDesc.style.transform='translateY('+((1-lqDescIn)*10).toFixed(1)+'px)';
      lqCtaRow.style.opacity=(lqCtaIn*(1-lqOut)).toFixed(3);
      lqCtaRow.style.pointerEvents=(lqCtaIn>.6 && lqOut<.5)?'auto':'none';

      // ---- uscita di scena, verso Documentation 4.0 (scena indipendente successiva): fino a .98, non
      // oltre — stesso principio già applicato altrove, niente scroll morto prima del cambio scena.
      // Qui il fondo carta di Documentation dà comunque un segnale di cambio scena immediato (a
      // differenza del confine Hyperparts/Hyper.LabQ, stesso identico colore di fondo su entrambe) ----
      const labToDoc = smooth(sub(s,.850,.98));
      ecoLabQImg.style.opacity=(lqPhotoIn*(1-labToDoc)).toFixed(3);
      ecoLabQImg.style.filter='blur('+(lerp(9,0,lqZoomIn)+lerp(0,16,labToDoc)).toFixed(2)+'px)';
      ecoLabQImg.style.transform='scale('+(lerp(1.28,1,lqZoomIn)*lerp(1,2.6,labToDoc)).toFixed(3)+')';
      ecoLabQImg.style.clipPath='circle('+lerp(150,8,labToDoc).toFixed(1)+'% at 50% 18%)';
    }

    function loop2(){ sP2+=(pRaw2-sP2)*0.08; render2(sP2); requestAnimationFrame(loop2); }
    addEventListener('scroll',readScroll2,{passive:true});
    readScroll2(); loop2();

    // il salto istantaneo dell'icona "Documenti 4.0" (capitolo1.js) sposta scrollY in un frame solo,
    // ma sP2 è smussato (+=(pRaw2-sP2)*0.08): senza questo, la scena visibile "insegue" per ~1-2s e si
    // rivede tutta la coreografia di Ecosistema 4.0 anche se lo scroll è già arrivato — sincronizzo sP2
    // subito al valore reale così render2 parte già dal punto giusto, senza inseguimento
    window.__snapScene2Instant=function(){ readScroll2(); sP2=pRaw2; render2(sP2); };
  }

  // Hyper.LabQ non è più una scena indipendente: è tornata dentro lo stesso sticky di Hyperparts (vedi
  // render2 sopra, blocco "HYPER.LABQ") — serviva lo stesso sticky condiviso per poter fare un vero
  // crossfade fra le due foto, impossibile fra due sticky separati (una foto non può "sbircia" mentre
  // l'altra è ancora in scena). Vedi il commento su "sOld"/k in cima a render2 per come si è fatto
  // spazio in coda senza ricalcolare le soglie di Ponte/Ecosistema/Project 2.0/Hyperparts.

  // ---- DOCUMENTATION 4.0 — scena indipendente (proprio sticky/scroll): prima viveva dentro scene2,
  // spostata qui per fare posto a Hyper.LabQ senza toccare le soglie di Ponte/Ecosistema/Project 2.0/
  // Hyperparts. Stesse identiche soglie di prima (erano [.800,1.0] su scene2, 940vh), solo rimappate
  // sulla propria timeline locale [0,1] — comportamento identico, cambia solo il contenitore ----
  const sceneDoc40=$('sceneDoc40');
  if(sceneDoc40 && !reduce){
    let pRawD40=0, sPD40=0;
    function readScrollD40(){ const denom=Math.max(1,sceneDoc40.offsetHeight-innerHeight); pRawD40=clamp((scrollY-sceneDoc40.offsetTop)/denom,0,1); }
    function renderD40(s){
      const dcTitleIn    = smooth(sub(s,0,.11));    // blocco che si rivela tramite maschera centrale + leggero scale
      // hold leggibile [.11,.16]: nessuna variabile qui, il titolo resta fermo e dominante
      const dcAccentIn   = smooth(sub(s,.085,.16));
      const dcTitleShift = smooth(sub(s,.215,.30));
      const dcSubIn      = smooth(sub(s,.315,.395));
      const dcParaIn     = smooth(sub(s,.395,.47));
      // hold reale [.47,.80] (~62% della scena): il tempo di leggere il paragrafo per intero
      // fino a .98, stesso principio delle altre due uscite di scena qui sopra: non lo aveva chiesto
      // esplicitamente, ma stesso identico problema (spazio nero prima del cambio scena verso Machine Map)
      const dcRetreat    = smooth(sub(s,.80,.98));
      const dcParaOut    = smooth(sub(s,.80,.98));

      dcTitle.style.opacity=(dcTitleIn*(1-dcRetreat)).toFixed(3);
      dcTitle.style.clipPath='inset(0 '+((1-dcTitleIn)*50).toFixed(1)+'% 0 '+((1-dcTitleIn)*50).toFixed(1)+'%)';
      dcTitle.style.transform='translateY(-'+(lerp(0,3,dcTitleShift)+lerp(0,2.5,dcRetreat)).toFixed(2)+'vh) scale('+(lerp(1.06,1,dcTitleIn)*lerp(1,.85,dcTitleShift)*lerp(1,.94,dcRetreat)).toFixed(3)+')';
      dcAccent.style.opacity=(dcAccentIn*(1-dcRetreat)).toFixed(3);
      dcAccent.style.transform='scaleX('+lerp(.2,1,dcAccentIn).toFixed(3)+')';
      dcSub.style.opacity=(dcSubIn*(1-dcRetreat)).toFixed(3);
      dcPara.style.transform='translateY('+lerp(lerp(100,0,dcParaIn),-100,dcParaOut).toFixed(2)+'%)';
      if(dcHint) dcHint.style.opacity=(dcSubIn*(1-dcRetreat)).toFixed(3);
    }
    function loopD40(){ sPD40+=(pRawD40-sPD40)*0.08; renderD40(sPD40); requestAnimationFrame(loopD40); }
    addEventListener('scroll',readScrollD40,{passive:true});
    readScrollD40(); loopD40();
    window.__snapDoc40Instant=function(){ readScrollD40(); sPD40=pRawD40; renderD40(sPD40); };
  }

  // Documentation 4.0 = Machine Map = soglia del Capitolo 03: UN SOLO sticky (mapServicesSticky), UN SOLO progresso
  // di scroll (render3/s), tre layer sovrapposti — mai due sticky indipendenti che si rincorrono, mai margin-top
  // negativo. La mappa nasce contenuta dentro il campo carta della scena Documentation e cresce fino a 100vw×100vh
  // (mai transform:scale, solo left/top/width/height per restare nitida), resta protagonista stabile per una fase
  // di esplorazione, poi un campo nero sale dal basso e la copre; banner rosso, titolo e sottotitolo del Capitolo 03
  // entrano nello STESSO viewport già mentre il nero sta chiudendo la mappa (mai dopo un vuoto nero), poi restano
  // fermi e leggibili per un hold reale (oltre una viewport) prima che l'arco dei servizi prenda il posto.
  const mapStage=$('mapServicesTransition'), mapFrame=$('ecoMapFrame'), mapChrome=$('docMapChrome'), mapOutro=$('mapOutro'),
        fsTarget=$('mapServicesSticky'), fsBtn=$('mapFsBtn'), fsFallback=$('mapFsFallback'),
        mapFsIcon=$('mapFsIcon'), mapFsBtnText=$('mapFsBtnText'), docMapIframe=$('docMapIframe'), docMapLoading=$('docMapLoading'),
        ch3Banner=$('ch3Banner'), svcOpenH=$('svcOpenH');
  if(mapStage && mapFrame){
    const mapCompact = window.matchMedia('(max-width:820px)').matches;
    // micro-label di caricamento, nessuno spinner/overlay: scompare all'evento load (con fallback nel caso sia già risolto prima dell'attach)
    if(docMapIframe && docMapLoading){
      docMapIframe.addEventListener('load', ()=>{ docMapLoading.hidden=true; }, {once:true});
      setTimeout(()=>{ docMapLoading.hidden=true; }, 4000);
    }
    // geometria "contenuta" di partenza: margini standard su desktop, più stretti su mobile — stessa card (top/left/right/height) usata altrove nel prototipo
    const mapMargin = mapCompact ? {left:3,top:5,width:94,height:90} : {left:6,top:12,width:88,height:76};
    let sP3=1; // progress corrente (scope condiviso con il gestore fullscreen); reduced motion resta a 1 (stabile, nessuna riscrittura inline)
    function render3(s){
      if(reduce) return; // reduced motion: la CSS dedicata mostra già mappa piena e outro disattivato, JS non tocca nulla
      if(fsTarget && fsTarget.classList.contains('isFullscreen')) return; // in fullscreen il CSS (!important) comanda, render3 non scrive mai
      // fase 1 [0,.16]: da mappa contenuta a piena, animando left/top/width/height (mai scale, per non perdere nitidezza)
      const growT = smooth(sub(s,0,.16));
      mapFrame.style.left=lerp(mapMargin.left,0,growT).toFixed(2)+'vw';
      mapFrame.style.top=lerp(mapMargin.top,0,growT).toFixed(2)+'vh';
      mapFrame.style.width=lerp(mapMargin.width,100,growT).toFixed(2)+'vw';
      mapFrame.style.height=lerp(mapMargin.height,100,growT).toFixed(2)+'vh';
      mapFrame.style.borderColor='rgba(20,20,18,'+(0.12*(1-growT)).toFixed(3)+')';
      // fase 2 [.16,.40]: mappa piena, stabile ed esplorabile — nessuna variabile
      // fase 3 [.40,.50]: il nero sale dal basso e copre la mappa; chrome/bottone fullscreen sfumano [.40,.44],
      // ben prima che il nero raggiunga la metà del viewport (~.45 con questa finestra)
      if(mapOutro) mapOutro.style.transform='translateY('+lerp(100,0,smooth(sub(s,.40,.50))).toFixed(2)+'%)';
      if(mapChrome) mapChrome.style.opacity=(1-smooth(sub(s,.40,.44))).toFixed(3);
      // fase 4 [.52,.60]: banner rosso "Capitolo 03 | Servizi" entra con UNA sola traslazione orizzontale da destra
      // (mai un fade). Prima iniziava a .48, mentre l'outro (nero, finisce a .50) copriva ancora solo l'80-100%
      // della mappa: il banner compariva sopra la mappa ancora parzialmente visibile. Ora parte 2 punti dopo la
      // fine dell'outro, con un margine di sicurezza reale, non solo teorico
      if(ch3Banner){
        const bannerIn = smooth(sub(s,.52,.60));
        ch3Banner.style.transform='translateX('+lerp(120,0,bannerIn).toFixed(2)+'%)';
      }
      // fase 5 [.58,.70]: titolo "Otto servizi. Un processo continuo." in blocco unico — maschera rettangolare
      // sinistra->destra + lieve scale-down, mai un fade — inizia mentre il banner sta ancora entrando
      // (stessa struttura di prima, solo l'intera sequenza spostata avanti di .04 insieme al banner)
      if(svcOpenH){
        const headIn = smooth(sub(s,.58,.70));
        svcOpenH.style.clipPath='inset(0 '+((1-headIn)*100).toFixed(1)+'% 0 0)';
        svcOpenH.style.transform='scale('+lerp(1.10,1,headIn).toFixed(3)+')';
      }
      // fase 7 [.74,1.0]: hold netto e leggibile — banner e titolo restano fermi sul nero pieno per
      // una porzione reale di scroll (ancora quasi una viewport intera, solo .04 più corta di prima); l'arco dei
      // servizi (sezione successiva, separata, senza margin-top negativo) inizia solo dopo la fine di questo hold
    }
    if(reduce){
      // niente coreografia: la mappa passa direttamente da contenuta a visibile (CSS statica dedicata), chiusura netta senza outro animato
    } else {
      // nessuno smoothing: si usa il progresso reale dello scroll (pRaw3) direttamente, così la mappa cresce ed esce
      // nello stesso istante in cui l'utente scorre, senza ritardo né "recupero" quando si è già superata la fase
      function readScroll3(){
        const denom=Math.max(1,mapStage.offsetHeight-innerHeight);
        sP3=clamp((scrollY-mapStage.offsetTop)/denom,0,1);
        render3(sP3);
      }
      addEventListener('scroll',readScroll3,{passive:true});
      readScroll3();
    }

    // Fullscreen — richiesto sul contenitore che comprende iframe + chrome (non sul solo iframe), così il bottone
    // resta dentro la vista fullscreen; fallback discreto se l'API non è disponibile o viene rifiutata
    const fsSupported = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
    const ICON_EXPAND='M9 3H3v6M15 3h6v6M21 15v6h-6M3 15v6h6';
    const ICON_CLOSE='M6 6L18 18M18 6L6 18';
    if(fsBtn && fsTarget){
      if(!fsSupported){
        fsBtn.hidden=true; if(fsFallback) fsFallback.hidden=false;
      } else {
        fsBtn.addEventListener('click', ()=>{
          try{
            const active=document.fullscreenElement||document.webkitFullscreenElement;
            if(!active){
              const req=fsTarget.requestFullscreen||fsTarget.webkitRequestFullscreen;
              const p=req?req.call(fsTarget):null;
              if(p&&p.catch) p.catch(()=>{ fsBtn.hidden=true; if(fsFallback) fsFallback.hidden=false; });
            } else {
              const exit=document.exitFullscreen||document.webkitExitFullscreen;
              if(exit) exit.call(document);
            }
          } catch(e){ fsBtn.hidden=true; if(fsFallback) fsFallback.hidden=false; }
        });
        const onFsChange=()=>{
          const active=(document.fullscreenElement||document.webkitFullscreenElement)===fsTarget;
          fsTarget.classList.toggle('isFullscreen', active);
          fsBtn.setAttribute('aria-label', active?'Chiudi mappa a schermo intero':'Espandi mappa a schermo intero');
          fsBtn.setAttribute('title', active?'Chiudi mappa':'Espandi mappa');
          if(mapFsBtnText) mapFsBtnText.textContent = active?'Chiudi mappa':'Espandi mappa';
          if(mapFsIcon){ const path=mapFsIcon.querySelector('path'); if(path) path.setAttribute('d', active?ICON_CLOSE:ICON_EXPAND); }
          if(!active) render3(sP3); // rientro: riallinea subito lo stile senza attendere il prossimo frame, niente flash
        };
        document.addEventListener('fullscreenchange', onFsChange);
        document.addEventListener('webkitfullscreenchange', onFsChange);
      }
    }
  }

  // Servizi — card a scroll orizzontale (dalla bozza duezero-scroll, riscritta senza librerie, stessa
  // grammatica sticky delle altre sezioni). Card desktop e lista mobile sono generate dallo stesso array
  // SERVICES: cambiare numero, titoli o testi dei servizi significa modificare solo questi dati.
  // href opzionale: solo i servizi con una pagina reale lo hanno (le altre card restano <a> senza
  // href, quindi inerti — stesso trattamento "pending" già usato altrove). data-service resta comunque
  // il riferimento allo slug per ogni card.
  const SERVICES=[
    {slug:'manualistica-tecnica',title:'Manualistica Tecnica',href:'manualistica-tecnica.html',
      img:'manualistica-tecnica-40-impaginazione-layout-dtp.jpg',
      sub:"Ingegnerizzazione della documentazione per macchine automatiche",
      desc:"Traduciamo la complessità del tuo macchinario in manuali d'uso, manutenzione e HMI chiari, strutturati e conformi al nuovo Regolamento Macchine. Riduci il time-to-market e proteggi la tua responsabilità di Fabbricante con il nostro workflow industriale certificato."},
    {slug:'cataloghi-ricambi',title:'Cataloghi Ricambi',href:'cataloghi-ricambi.html',
      img:'catalogo-ricambi-digitale-app-hyper-parts-smartphone.jpg',
      sub:"Gestione ricambi e post-vendita Industry 4.0: la piattaforma Hyper.Parts",
      desc:"Trasforma il tuo After Sales in un centro di profitto. Con la piattaforma interattiva Hyper.Parts e il servizio integrato Due.Zero, offri ai tuoi clienti la consultazione 3D delle tavole ricambi da web e mobile, incrementando la vendita di parti originali."},
    {slug:'traduzioni-multilingue',title:'Traduzioni Multilingue',href:'traduzioni-multilingue.html',
      img:'traduzioni-tecniche-post-editing-iso-18587-glossario.jpg',
      sub:"Traduzioni tecniche multilingue, localizzazione certificata ISO 17100 e post-editing ISO 18587",
      desc:"Servizi di traduzione specialistica per l'industria meccanica e l'automazione. Integriamo la traduzione umana certificata ISO 17100 con i processi di post-editing umano ISO 18587 (Light e Full) su contenuti generati da traduzione automatica (MT/AI), garantendo rigore terminologico, massima velocità ed export globale."},
    {slug:'technical-compliance',title:'Technical Compliance',href:'technical-compliance.html',
      img:'valutazione-rischi-direttiva-macchine-technical-compliance.jpg',
      sub:"Technical Compliance e marcature CE: consulenza normativa e Risk Assessment",
      desc:"Guida completa verso la conformità normativa: valutazione dei rischi (UNI EN ISO 12100), calcolo del Performance Level (ISO 13849) e predisposizione del fascicolo tecnico per garantire la sicurezza del macchinario e la marcatura CE."},
    {slug:'soluzioni-creative',title:'Marketing Industriale',href:'soluzioni-creative.html',
      img:'modellazione-cad-3d-esplosi-ricambi-marketing-industriale.jpg',
      sub:"Marketing industriale B2B, eventi fieristici e digital communication per B2B/OEM",
      desc:"Comunica il valore della tua tecnologia con un approccio specialistico. Realizziamo render 3D, video tecnici, allestimenti e contenuti multimediali per le principali fiere mondiali dell'automazione (Interpack, Cibus Tec, IPACK-IMA). Sviluppiamo portali web e piani editoriali LinkedIn ad alto valore ingegneristico."},
    {slug:'soluzioni-software',title:'Soluzioni Software 2.0',href:'soluzioni-software.html',
      img:'soluzioni-software-custom-integrazione-gestionale-cad.jpg',
      sub:"Soluzioni software custom, gestionali avanzati e digitalizzazione dei processi industriali",
      desc:"Dalla gestione della documentazione tecnica allo sviluppo di software gestionali customizzati per l'intera organizzazione aziendale. Sfruttiamo la nostra visione strategica e l'intelligenza artificiale per creare piattaforme su misura (es. HyperLab) compliant con le norme ISO 9001 e ISO/IEC 17025."}
  ];
  const svcStage=$('svcStage'), svcTrack=$('svcTrack'), svcMobileList=$('svcMobileList'),
        svcCounter=$('svcCounter'), svcProgressBar=$('svcProgressBar');
  if(svcTrack && svcMobileList){
    const esc=s=>s.replace(/&/g,'&amp;');
    SERVICES.forEach((s,i)=>{
      const num=String(i+1).padStart(2,'0');
      const card=document.createElement('a');
      card.className='service-card';
      card.dataset.service=s.slug;
      if(s.href) card.href=s.href; // senza href l'<a> resta inerte: stesso trattamento "pending" già usato altrove
      card.innerHTML='<div class="sc-bg" style="background-image:url(\'img/services/gallery/'+s.img+'\')"></div>'+
        '<div class="sc-num">'+num+'</div>'+
        '<h3 class="sc-title">'+esc(s.title)+'</h3>'+
        '<p class="sc-sub">'+esc(s.sub)+'</p>'+
        '<p class="sc-desc">'+esc(s.desc)+'</p>'+
        '<div class="sc-cta">Dettagli servizio <span>→</span></div>'+
        '<div class="sc-link-icon">↗</div>';
      svcTrack.appendChild(card);
      const item=document.createElement('a');
      item.className='svcMobileItem';
      item.dataset.service=s.slug;
      if(s.href) item.href=s.href;
      item.style.backgroundImage="url('img/services/gallery/"+s.img+"')";
      item.innerHTML='<span class="svcMobileNum">'+num+'</span>'+
        '<span class="svcMobileContent">'+
          '<span class="svcMobileName">'+esc(s.title)+'</span>'+
          '<span class="svcMobileArrow">→</span>'+
        '</span>';
      svcMobileList.appendChild(item);
    });

    // pin + corsa orizzontale solo su desktop e senza reduced-motion: sotto i 1024px il CSS nasconde
    // lo stage e mostra la lista verticale. La soglia va rivalutata a ogni resize (non letta una volta
    // sola): se il viewport attraversa il breakpoint, misura e stato si riallineano da soli
    if(svcStage && !reduce){
      const svcCards=[...svcTrack.children];
      let svcTravel=1, svcActive=false;
      function measureSvc(){
        svcActive=innerWidth>=1024;
        if(!svcActive){ svcStage.style.height=''; svcTrack.style.transform=''; return; }
        // margine dinamico prima della prima card e dopo l'ultima: con soli 38px fissi, la prima e
        // l'ultima card non arrivavano MAI al centro del viewport durante lo scroll (restavano sempre
        // a sinistra/destra del centro) — non si "accendevano" mai da sole, solo con l'hover reale.
        // Serve uno spazio pari a metà della differenza fra viewport e larghezza card, cosi la prima
        // card può centrarsi appena iniziato lo scroll e l'ultima appena prima che finisca
        const cardW=svcCards[0] ? svcCards[0].offsetWidth : 380;
        const edgePad=Math.max(38,(innerWidth-cardW)/2);
        svcTrack.style.paddingLeft=edgePad+'px';
        svcTrack.style.paddingRight=edgePad+'px';
        // svcTravel misurato dalla posizione REALE dell'ultima card (non da scrollWidth): con
        // scrollWidth-innerWidth l'ultima card restava sempre ~un edgePad a destra del centro,
        // non si centrava mai a fine corsa — scrollWidth non corrispondeva esattamente alla
        // geometria effettiva. Azzero temporaneamente il transform per misurare la posizione
        // "a riposo", poi lo ripristino (il prossimo frame di renderSvc lo correggerà comunque)
        const prevTransform=svcTrack.style.transform;
        svcTrack.style.transform='translateX(0px)';
        const lastCard=svcCards[svcCards.length-1];
        const lastRect=lastCard.getBoundingClientRect();
        svcTravel=Math.max(1, lastRect.left+lastRect.width/2-innerWidth/2);
        svcTrack.style.transform=prevTransform;
        // 1px di scroll = 1px di corsa orizzontale: lo stage è alto quanto viewport + corsa
        svcStage.style.height=(innerHeight+svcTravel)+'px';
      }
      function renderSvc(p){
        if(!svcActive) return;
        svcTrack.style.transform='translateX('+(-p*svcTravel).toFixed(1)+'px)';
        if(svcProgressBar) svcProgressBar.style.width=(p*100).toFixed(2)+'%';
        if(svcCounter) svcCounter.textContent=(Math.min(SERVICES.length,Math.round(p*(SERVICES.length-1))+1))+' / '+String(SERVICES.length).padStart(2,'0');
        // spotlight: piena opacità al centro del viewport, attenuata ai lati; l'hover vince sempre.
        // La card più vicina al centro riceve anche .active — stesso trattamento dell'hover reale
        // (bordo rosso, overlay bianco, zoom immagine): passa da una card all'altra scrollando,
        // richiesto dal capo, non solo al passaggio del mouse
        const viewCenter=innerWidth/2;
        let closestCard=null, closestDist=Infinity;
        svcCards.forEach(card=>{
          if(card._hovered){ card.style.opacity='1'; return; }
          const r=card.getBoundingClientRect();
          const dist=Math.abs(r.left+r.width/2-viewCenter);
          const k=Math.max(0,1-dist/(innerWidth*0.55));
          card.style.opacity=(0.28+k*0.72).toFixed(2);
          if(dist<closestDist){ closestDist=dist; closestCard=card; }
        });
        svcCards.forEach(card=>{ card.classList.toggle('active', card===closestCard); });
      }
      svcCards.forEach(card=>{
        card.addEventListener('mouseenter',()=>{ card._hovered=true; card.style.opacity='1'; });
        card.addEventListener('mouseleave',()=>{ card._hovered=false; });
      });
      let pRaw5=0, sP5=0;
      function readScroll5(){ pRaw5=clamp((scrollY-svcStage.offsetTop)/svcTravel,0,1); }
      function loop5(){ sP5+=(pRaw5-sP5)*0.09; renderSvc(sP5); requestAnimationFrame(loop5); } // stesso smoothing dell'ex arco
      addEventListener('scroll',readScroll5,{passive:true});
      addEventListener('resize',()=>{ measureSvc(); readScroll5(); });
      measureSvc(); readScroll5(); renderSvc(0); loop5();
    }
  }

  // ================= CAPITOLO 04 — QUALITÀ =================
  // Un solo sticky, quattro gesti in sequenza legati direttamente allo scroll (nessuno smoothing artificiale,
  // stesso principio "risposta immediata" già usato per la Machine Map). A differenza dell'arco Servizi, qui
  // l'hold su ogni sigla è esplicitamente richiesto: si riusa il tecnica ramp+hold per singola tappa.
  const qualitySection=$('qualitySection'), qualitySticky=$('qualitySticky');
  if(qualitySection && qualitySticky && !reduce){
    const qualityPaper=$('qualityPaper'), qualityIntro=$('qualityIntro'),
          qualityBanner=qualityIntro&&qualityIntro.querySelector('.qualityBanner'),
          qualityH2=qualityIntro&&qualityIntro.querySelector('h2'),
          qualityP=qualityIntro&&qualityIntro.querySelector('p'),
          qualityMethod=$('qualityMethod'),
          qualityEyebrow=qualityMethod&&qualityMethod.querySelector('.qualityEyebrow'),
          qualityCodeMaskEl=qualityMethod&&qualityMethod.querySelector('.qualityCodeMask'),
          qualityCodeStrip=$('qualityCodeStrip'), qualityDefinition=$('qualityDefinition'),
          qualityRecord=$('qualityRecord'), qualityMeta=qualityRecord&&qualityRecord.querySelector('.qualityMeta'),
          qualityFinal=$('qualityFinal'), qualityFinalH=qualityFinal&&qualityFinal.querySelector('h3'),
          qualityCta=qualityFinal&&qualityFinal.querySelector('.qualityCta');

    const QUALITY_STEPS=[
      {code:'DQ',text:'PROGETTAZIONE VERIFICATA.'},
      {code:'IQ',text:'INSTALLAZIONE VERIFICATA.'},
      {code:'OQ',text:'OPERATIVITÀ VERIFICATA.'},
      {code:'PQ',text:'PRESTAZIONI VERIFICATE.'}
    ];
    const qCount=QUALITY_STEPS.length; // 4 — fisso, non un elenco variabile come l'arco

    // pannello definizione: cambia con breve maschera verticale quando la sigla frontale cambia (stesso
    // principio già usato per il pannello Servizi), nessun contatore numerico
    let qualityActiveIdx=-1;
    function setQualityDefinition(idx){
      if(idx===qualityActiveIdx || !qualityDefinition) return;
      qualityActiveIdx=idx;
      qualityDefinition.style.clipPath='inset(0 0 100% 0)';
      setTimeout(()=>{
        qualityDefinition.textContent=QUALITY_STEPS[idx].text;
        void qualityDefinition.offsetWidth;
        qualityDefinition.style.clipPath='inset(0 0 0% 0)';
      },190);
    }

    // quattro tappe con rampa + hold (a differenza dell'arco Servizi, qui l'hold leggibile per sigla è
    // esplicitamente richiesto): 3 transizioni per 4 sigle, stesso principio "N-1 passi per N elementi"
    function qualityCodePos(s){
      const START=.269, END=.756, STEPS=qCount-1, stepW=(END-START)/STEPS;
      let sum=0;
      for(let k=0;k<STEPS;k++){
        const start=START+k*stepW, rampEnd=start+stepW*0.60;
        sum+=smooth(sub(s,start,rampEnd));
      }
      return sum; // 0..3, monotono
    }

    function renderQuality(s){
      // ---- scena 1 — apertura [.00,.25]: carta sale piena (niente fade), poi banner, poi titolo in blocco
      // unico con maschera orizzontale + lieve scale-down, poi sottotitolo dopo una breve pausa ----
      // preQuality: stesso principio di preBridge (Capitolo 1 -> Ecosistema, vedi render2) — lo sticky
      // dell'arco Servizi si sblocca nativamente nelle ultime 100vh del suo scroll, PRIMA che "s" (legato
      // all'inizio di qualitySection) inizi a muoversi: restava nero fermo per tutta quella finestra, il
      // vero "spazio nero" segnalato (fatto notare dal capo). preQuality segue lo scroll reale (non
      // smussato) e anticipa lì la salita della carta, così è già in movimento mentre l'arco sta ancora
      // sbloccandosi, invece di restare ferma in attesa
      const preQuality=smooth(clamp((scrollY-(qualitySection.offsetTop-innerHeight))/innerHeight,0,1));
      const paperRise=Math.max(preQuality, smooth(sub(s,0,.061)));
      if(qualityPaper) qualityPaper.style.transform='translateY('+((1-paperRise)*101).toFixed(2)+'%)';
      if(qualityBanner) qualityBanner.style.transform='translateX('+lerp(120,0,smooth(sub(s,.038,.098))).toFixed(2)+'%)';
      if(qualityH2){
        const headIn=smooth(sub(s,.076,.144));
        qualityH2.style.clipPath='inset(0 '+((1-headIn)*100).toFixed(1)+'% 0 0)';
        qualityH2.style.transform='scale('+lerp(1.06,1,headIn).toFixed(3)+')';
      }
      if(qualityP) qualityP.style.opacity=smooth(sub(s,.151,.189)).toFixed(3);
      // hold di lettura vero: prima il ritiro iniziava esattamente dove finiva l'ingresso del
      // sottotitolo, zero pausa — spariva subito, "troppo veloce" segnalato. Inserita una pausa reale
      if(qualityIntro){
        const introOut=smooth(sub(s,.220,.263)); // il titolo iniziale si ritrae tramite crop
        qualityIntro.style.clipPath='inset(0 0 0 '+(introOut*100).toFixed(1)+'%)';
      }

      // ---- scena 2 — metodo: la maschera dei codici e la definizione entrano con una semplice
      // dissolvenza (non un crop: un crop orizzontale relativo al viewport ritarderebbe la comparsa di un
      // testo ancorato a sinistra, creando un vuoto), poi riga eyebrow, poi DQ/IQ/OQ/PQ una alla volta con
      // hold leggibile — il ciclo dei quattro codici (vedi qualityCodePos) ha ora +135vh reali di corsa,
      // il doppio di prima: "molto molto veloce" segnalato, restava a malapena ~34vh a codice; infine il
      // metodo esce tramite crop, come richiesto, prima della tracciabilità ----
      if(qualityCodeMaskEl) qualityCodeMaskEl.style.opacity=smooth(sub(s,.227,.263)).toFixed(3);
      if(qualityDefinition) qualityDefinition.style.opacity=smooth(sub(s,.227,.263)).toFixed(3);
      if(qualityEyebrow) qualityEyebrow.style.opacity=smooth(sub(s,.248,.284)).toFixed(3);
      if(qualityCodeStrip){
        const pos=qualityCodePos(s);
        qualityCodeStrip.style.transform='translateY(-'+(pos*(100/qCount)).toFixed(2)+'%)';
        setQualityDefinition(clamp(Math.round(pos),0,qCount-1));
      }
      if(qualityMethod){
        const methodOut=smooth(sub(s,.764,.814)); // il metodo esce tramite crop
        qualityMethod.style.clipPath='inset(0 0 0 '+(methodOut*100).toFixed(1)+'%)';
      }

      // ---- scena 3 — tracciabilità: entra dal basso come un foglio tecnico (solo translateY,
      // niente ombra/card) — la risalita parte presto e generosa, così è già ben visibile quando il metodo
      // sparisce (evita qualunque vuoto nel mezzo); il testo domina, poi metadati e firma dopo una pausa ----
      if(qualityRecord) qualityRecord.style.transform='translateY('+lerp(100,0,smooth(sub(s,.685,.828))).toFixed(2)+'%)';
      if(qualityMeta) qualityMeta.style.opacity=smooth(sub(s,.856,.907)).toFixed(3);

      // ---- scena 4 — chiusura: un campo nero (il layer stesso) sale sopra la carta, poi titolo,
      // poi CTA — nessun box pieno, solo testo ----
      if(qualityFinal) qualityFinal.style.transform='translateY('+lerp(100,0,smooth(sub(s,.929,.971))).toFixed(2)+'%)';
      if(qualityFinalH) qualityFinalH.style.opacity=smooth(sub(s,.957,.986)).toFixed(3);
      if(qualityCta) qualityCta.style.opacity=smooth(sub(s,.979,1.0)).toFixed(3);
    }

    // risposta diretta allo scroll, nessuno smoothing artificiale — stesso principio già richiesto e
    // verificato per la Machine Map, per evitare qualunque ritardo percepito su una sezione così lunga
    function readScrollQ(){
      const denom=Math.max(1,qualitySection.offsetHeight-innerHeight);
      renderQuality(clamp((scrollY-qualitySection.offsetTop)/denom,0,1));
    }
    addEventListener('scroll',readScrollQ,{passive:true});
    readScrollQ();
    setQualityDefinition(0); // prima sigla/definizione già scritte in HTML: nessun crossfade spurio al primo frame
  }

  // ================= CAPITOLO 05 — NEWS =================
  // Ridotta alla sola apertura (contenuti editoriali non ancora pronti): non più tre scene sticky in
  // sequenza, quindi stesso meccanismo del Footer sotto — reveal one-shot quando la sezione raggiunge
  // il viewport, non uno scroll-jack continuo.
  const newsSection=$('newsSection');
  if(newsSection && !reduce){
    let newsRevealed=false;
    function checkNewsReveal(){
      if(newsRevealed) return;
      const r=newsSection.getBoundingClientRect();
      if(r.top<innerHeight*0.85){
        newsRevealed=true;
        newsSection.classList.add('revealed');
        removeEventListener('scroll',checkNewsReveal);
      }
    }
    addEventListener('scroll',checkNewsReveal,{passive:true});
    checkNewsReveal();
  }

  // ================= FOOTER =================
  // Non è un'altra scena sticky: è la chiusura normale del documento. L'anno si scrive sempre (non è
  // un'animazione). Il reveal (titolo/CTA/logo/blocchi) scatta una sola volta quando il footer raggiunge
  // il viewport, poi il listener si stacca — nessun progresso continuo da mantenere per il resto della vita
  // della pagina, a differenza delle sezioni sticky sopra.
  const footerEl=$('parliamone');
  if(footerEl){
    const footerYear=$('footerYear');
    if(footerYear) footerYear.textContent=new Date().getFullYear();

    if(!reduce){
      let footerRevealed=false;
      function checkFooterReveal(){
        if(footerRevealed) return;
        const r=footerEl.getBoundingClientRect();
        if(r.top<innerHeight*0.85){
          footerRevealed=true;
          footerEl.classList.add('revealed');
          removeEventListener('scroll',checkFooterReveal);
        }
      }
      addEventListener('scroll',checkFooterReveal,{passive:true});
      checkFooterReveal();
    }
  }
})();
