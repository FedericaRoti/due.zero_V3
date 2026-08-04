(function(){
  const $=id=>document.getElementById(id);
  const scene2=$('scene2'); if(!scene2) return;
  const bgHyper=$('bgHyper'), bgPaper2=$('bgPaper2'),
        ecoBridge=$('ecoBridge'), ch2Banner=$('ch2Banner'), ch2BannerBar=$('ch2BannerBar'), ch2BannerText=$('ch2BannerText'),
        ecoOpenH=$('ecoOpenH'), ecoOpenSub=$('ecoOpenSub'),
        ecoProjectImg=$('ecoProjectImg'), pjGroup=$('pjGroup'), pjTitle=$('pjTitle'), pjSub=$('pjSub'), pjMono=$('pjMono'), pjCta=$('pjCta'),
        hpTitle=$('hpTitle'), hpSub=$('hpSub'), hpMono=$('hpMono'), hpCta=$('hpCta'), ecoHyperImg=$('ecoHyperImg'),
        dcTitle=$('dcTitle'), dcAccent=$('dcAccent'), dcSub=$('dcSub'), dcPara=$('dcPara');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)), sub=(p,a,b)=>clamp((p-a)/(b-a),0,1), smooth=t=>t*t*(3-2*t), lerp=(a,b,t)=>a+(b-a)*t;

  if(!reduce){
    // ---- UNA sola progressione di scroll + UNO smoothing per tutto il Capitolo 2 ----
    let pRaw2=0, sP2=0;
    function readScroll2(){ const denom=Math.max(1,scene2.offsetHeight-innerHeight); pRaw2=clamp((scrollY-scene2.offsetTop)/denom,0,1); }

    function render2(s){
      // ---- Ponte Cap.1 -> Cap.2 [0,.144]: il perimetro della card si espande (0-.072), poi il campo carta diventa nero (.072-.144) ----
      const bridgeExpand = smooth(sub(s,0,.072));
      const bridgeBlacken = smooth(sub(s,.072,.144));
      ecoBridge.style.top=lerp(12,0,bridgeExpand).toFixed(2)+'vh';
      ecoBridge.style.left=lerp(6,0,bridgeExpand).toFixed(2)+'vw';
      ecoBridge.style.right=lerp(6,0,bridgeExpand).toFixed(2)+'vw';
      ecoBridge.style.height=lerp(76,100,bridgeExpand).toFixed(2)+'vh';
      ecoBridge.style.borderColor='rgba(20,20,18,'+(0.12*(1-bridgeExpand)).toFixed(3)+')';
      ecoBridge.style.boxShadow='0 6px 18px rgba(0,0,0,'+(0.08*(1-bridgeExpand)).toFixed(3)+')';
      const brR=Math.round(lerp(237,10,bridgeBlacken)), brG=Math.round(lerp(237,10,bridgeBlacken)), brB=Math.round(lerp(234,10,bridgeBlacken));
      ecoBridge.style.background='rgb('+brR+','+brG+','+brB+')';

      // ---- Apertura Ecosistema [.144,.234]: banner di capitolo (linea -> barra piena -> testo) -> headline in blocco unico -> pausa breve -> secondario ----
      const lineGrow     = smooth(sub(s,.144,.156));  // linea rossa sottile che si estende in larghezza
      const barFill      = smooth(sub(s,.153,.168));  // la linea si ispessisce in barra piena (stessa logica del Capitolo 1)
      const bannerTextIn = smooth(sub(s,.164,.180));  // testo mono, entra a barra quasi completata
      const headIn  = smooth(sub(s,.160,.216));   // scala + opacity soltanto: MAI split text, MAI translateY dal basso, MAI stagger
      const subIn   = smooth(sub(s,.222,.234));   // entra solo dopo la breve pausa dalla headline

      // ---- pausa di lettura [.234,.270]: nessuna variabile qui, la scena resta ferma ----

      // ---- Ponte verso 2.0 PROJECT [.270,.36]: la headline si ritrae con crop/maschera, emerge l'immagine ----
      const retreat = smooth(sub(s,.270,.36));    // gesto dominante: clip-path, non un fade
      ch2Banner.style.opacity=(1-retreat).toFixed(3);
      ch2BannerBar.style.width=(lineGrow*100).toFixed(1)+'%';
      ch2BannerBar.style.height=lerp(3,100,barFill).toFixed(1)+'%';
      ch2BannerText.style.opacity=bannerTextIn.toFixed(3);
      ch2BannerText.style.transform='translateY('+((1-bannerTextIn)*8).toFixed(1)+'px)';
      ecoOpenH.style.opacity=(headIn*(1-retreat)).toFixed(3);
      ecoOpenH.style.transform='scale('+lerp(1.06,1,headIn).toFixed(3)+')';
      ecoOpenH.style.clipPath='inset(0 '+(retreat*100).toFixed(1)+'% 0 0)';
      ecoOpenSub.style.opacity=(subIn*(1-retreat)).toFixed(3);

      const imgFadeIn = smooth(sub(s,.270,.300)); // opacity solo come supporto rapido, il resto è leggibile senza
      const cropOut   = retreat;                  // stessa progressione della headline: il crop del testo genera l'entrata dell'immagine

      // ---- primo frame di 2.0 PROJECT, 5 stati distinti ----
      // A. entrata (titolo -> sottotitolo) + hold leggibile [.335,.402]
      const titleIn  = smooth(sub(s,.335,.360));   // il titolo entra quando l'immagine è già leggibile
      const subInPj  = smooth(sub(s,.358,.380));   // sottotitolo, leggera coda sul titolo
      // hold leggibile [.380,.402]: nessuna variabile qui, il gruppo resta fermo e leggibile
      // B. riallineamento [.402,.432]: il gruppo titolo+sottotitolo sale, un solo gesto continuo legato allo scroll;
      //    la scritta "2.0 PROJECT" aumenta di dimensione in vista della seconda parte (riga mono + CTA)
      const regroup   = smooth(sub(s,.402,.432));
      const titleGrow = smooth(sub(s,.402,.434));  // risolto esattamente quando entra la riga mono
      // C. informazione [.434,.452] e CTA [.462,.482], solo dopo il riallineamento, con pausa breve fra le due
      const monoIn   = smooth(sub(s,.434,.452));
      const ctaIn    = smooth(sub(s,.462,.482));
      // hold reale della CTA [.482,.527] (~0.045): frame Project stabile e cliccabile, poi uscita di scena
      const projectOut = smooth(sub(s,.527,.541));

      const pjImgExit = smooth(sub(s,.541,.575));  // dopo l'hold della CTA: il campo Project si espande e perde fuoco, non una dissolvenza
      ecoProjectImg.style.opacity=(imgFadeIn*(1-pjImgExit)).toFixed(3);
      ecoProjectImg.style.filter='blur('+(lerp(5,0,cropOut)+lerp(0,10,pjImgExit)).toFixed(2)+'px)';
      ecoProjectImg.style.backgroundSize=lerp(340,130,cropOut).toFixed(0)+'% auto';
      ecoProjectImg.style.backgroundPosition=lerp(44,46,cropOut).toFixed(1)+'% '+lerp(22,40,cropOut).toFixed(1)+'%';
      ecoProjectImg.style.transform='translate('+(lerp(14,0,cropOut)+lerp(0,22,pjImgExit)).toFixed(2)+'vw,-50%) scale('+(lerp(.55,1,cropOut)*lerp(1,1.35,pjImgExit)).toFixed(3)+')';

      pjGroup.style.opacity=(1-projectOut).toFixed(3);
      pjGroup.style.transform='translateY(-'+lerp(0,12,regroup).toFixed(2)+'vh)';
      pjTitle.style.opacity=titleIn.toFixed(3);
      pjTitle.style.transform='translateY('+((1-titleIn)*18).toFixed(1)+'px) scale('+lerp(1,1.2,titleGrow).toFixed(3)+')';
      pjSub.style.opacity=subInPj.toFixed(3);
      pjMono.style.opacity=(monoIn*(1-projectOut)).toFixed(3);
      pjMono.style.transform='translateY('+((1-monoIn)*10).toFixed(1)+'px)';
      pjCta.style.opacity=(ctaIn*(1-projectOut)).toFixed(3);
      pjCta.style.pointerEvents=(ctaIn>.6 && projectOut<.5)?'auto':'none';

      // ---- fondo Hyperparts — quando inizia la transizione verso Documentation, il fondo carta Due.Zero prende il sopravvento ----
      const cGroup = smooth(sub(s,.545,.615));
      const dGroup = smooth(sub(s,.830,.880));
      bgHyper.style.opacity=(cGroup*(1-dGroup)).toFixed(3);
      bgPaper2.style.opacity=dGroup.toFixed(3);

      // ---- Transizione Project -> Hyperparts [.541,.635]: da un accesso individuale a un tavolo di lavoro condiviso ----
      const hpImgFadeIn = smooth(sub(s,.547,.581));  // crossfade fra le due immagini, sovrapposto al gesto di pjImgExit
      const hpZoomOut   = smooth(sub(s,.541,.635));  // crop ravvicinato e sfocato sul monitor -> arretra fino a tavolo/persone/schermo

      // ---- HYPERPARTS: titolo dominante (parola intera via maschera laterale) -> hold -> si riduce per lasciare spazio -> sottotitolo -> riga mono -> pausa -> CTA -> hold reale ----
      const hpTitleWipe  = smooth(sub(s,.610,.660));
      // hold leggibile [.660,.685]: nessuna variabile qui, il titolo resta fermo e dominante
      const hpTitleShift = smooth(sub(s,.685,.713));  // il titolo si riduce leggermente e lascia spazio al sottotitolo
      const hpSubIn      = smooth(sub(s,.715,.737));
      const hpMonoIn     = smooth(sub(s,.743,.761));
      // pausa breve [.761,.773]
      const hpCtaIn      = smooth(sub(s,.773,.793));
      // hold reale della CTA [.793,.824]: CTA e titolo restano fermi e cliccabili, Documentation non parte prima

      // ---- uscita di Hyperparts (testo/CTA), solo quando inizia la transizione verso Documentation, mai durante ingresso o hold ----
      const hpOut = smooth(sub(s,.824,.865));
      hpTitle.style.opacity=(hpTitleWipe*(1-hpOut)).toFixed(3);
      hpTitle.style.clipPath='inset(0 '+((1-hpTitleWipe)*100).toFixed(1)+'% 0 0)';
      hpTitle.style.transform='translateY(-'+lerp(0,7,hpTitleShift).toFixed(2)+'vh) scale('+(lerp(1.05,1,hpTitleWipe)*lerp(1,.85,hpTitleShift)).toFixed(3)+')';
      hpSub.style.opacity=(hpSubIn*(1-hpOut)).toFixed(3);
      hpSub.style.transform='translateX('+((1-hpSubIn)*-10).toFixed(1)+'px)';
      hpMono.style.opacity=(hpMonoIn*(1-hpOut)).toFixed(3);
      hpMono.style.transform='translateY('+((1-hpMonoIn)*10).toFixed(1)+'px)';
      hpCta.style.opacity=(hpCtaIn*(1-hpOut)).toFixed(3);
      hpCta.style.pointerEvents=(hpCtaIn>.6 && hpOut<.5)?'auto':'none';

      // ---- Transizione Hyperparts -> Documentation 4.0 [.824,.880]: il campo luminoso del monitor si espande fino al viewport ----
      // gesto unico: crop (zoom sul punto luminoso), maschera (iride che si chiude), trasformazione (scale); il fondo vira da scuro a carta (sopra)
      const hpToDocT = smooth(sub(s,.824,.880));
      ecoHyperImg.style.opacity=(hpImgFadeIn*(1-hpToDocT)).toFixed(3);
      ecoHyperImg.style.filter='blur('+(lerp(9,0,hpZoomOut)+lerp(0,16,hpToDocT)).toFixed(2)+'px)';
      ecoHyperImg.style.transform='scale('+(lerp(1.28,1,hpZoomOut)*lerp(1,2.6,hpToDocT)).toFixed(3)+')';
      ecoHyperImg.style.clipPath='circle('+lerp(150,8,hpToDocT).toFixed(1)+'% at 50% 18%)';

      // ---- DOCUMENTATION 4.0 [.880,1.0]: soglia testuale, fondo carta, titolo dominante centrato — poi si ritira: non è un'appendice, è la soglia della Machine Map ----
      const dcTitleIn    = smooth(sub(s,.880,.902));  // blocco che si rivela tramite maschera centrale + leggero scale: mai split-text, mai dal basso
      // hold leggibile [.902,.923]: nessuna variabile qui, il titolo resta fermo e dominante
      const dcAccentIn   = smooth(sub(s,.897,.912));  // piccolo accento rosso strutturale, non decorativo
      const dcTitleShift = smooth(sub(s,.923,.940));  // il titolo si compatta e si alza leggermente, lascia spazio sotto
      const dcSubIn      = smooth(sub(s,.943,.959));
      const dcRetreat    = smooth(sub(s,.986,1.0));  // titolo, sottotitolo e accento: ritiro delicato invariato — non devono restare sopra la mappa
      // ---- riga mono [.959,1.0]: STESSA grammatica editoriale delle altre righe del prototipo (vedi .c1b-text .ph/.ph i) —
      // wrapper overflow:hidden + riga intera che entra con translateY(100%->0), resta leggibile in hold, esce con
      // translateY(0->-100%). Nessuna rotazione, nessuno spostamento laterale, nessuno scatto. ----
      const dcParaIn     = smooth(sub(s,.959,.974));  // ingresso: riga intera dal basso
      // hold leggibile [.974,.984]: nessuna variabile qui, la riga resta ferma
      const dcParaOut    = smooth(sub(s,.984,1.0));   // uscita: stessa maschera verticale, verso l'alto

      dcTitle.style.opacity=(dcTitleIn*(1-dcRetreat)).toFixed(3);
      dcTitle.style.clipPath='inset(0 '+((1-dcTitleIn)*50).toFixed(1)+'% 0 '+((1-dcTitleIn)*50).toFixed(1)+'%)';
      dcTitle.style.transform='translateY(-'+(lerp(0,3,dcTitleShift)+lerp(0,2.5,dcRetreat)).toFixed(2)+'vh) scale('+(lerp(1.06,1,dcTitleIn)*lerp(1,.85,dcTitleShift)*lerp(1,.94,dcRetreat)).toFixed(3)+')';
      dcAccent.style.opacity=(dcAccentIn*(1-dcRetreat)).toFixed(3);
      dcAccent.style.transform='scaleX('+lerp(.2,1,dcAccentIn).toFixed(3)+')';
      dcSub.style.opacity=(dcSubIn*(1-dcRetreat)).toFixed(3);
      dcPara.style.transform='translateY('+lerp(lerp(100,0,dcParaIn),-100,dcParaOut).toFixed(2)+'%)';
    }

    function loop2(){ sP2+=(pRaw2-sP2)*0.08; render2(sP2); requestAnimationFrame(loop2); }
    addEventListener('scroll',readScroll2,{passive:true});
    readScroll2(); loop2();
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
        ch3Banner=$('ch3Banner'), svcOpenH=$('svcOpenH'), svcOpenSub=$('svcOpenSub');
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
      // fase 6 [.68,.74]: sottotitolo — inizia mentre il titolo sta ancora rivelandosi
      if(svcOpenSub) svcOpenSub.style.opacity=smooth(sub(s,.68,.74)).toFixed(3);
      // fase 7 [.74,1.0]: hold netto e leggibile — banner, titolo e sottotitolo restano fermi sul nero pieno per
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
  // Le card non hanno href — le pagine servizio non esistono ancora (slug da congelare, vedi
  // DA-CHIEDERE.md): data-service è il segnaposto del collegamento futuro.
  const SERVICES=[
    {slug:'manualistica-tecnica',title:'Manualistica Tecnica',
      desc:"Gestiamo l'intero ciclo di produzione della documentazione tecnica. Manuali chiari ed efficaci che aumentano il prestigio del vostro macchinario garantendo sicurezza all'utente.",
      tags:['Uso e Manutenzione','Istruzioni Montaggio','Redazione Strutturata','Safety First']},
    {slug:'technical-compliance',title:'Technical Compliance',
      desc:"Validiamo i vostri macchinari secondo le normative vigenti. Dall'analisi dei rischi alla redazione del fascicolo tecnico, garantiamo conformità agli standard CE.",
      tags:['Marcatura CE','Analisi dei Rischi','Fascicolo Tecnico','Risk Assessment']},
    {slug:'traduzioni-multilingue',title:'Traduzioni Multilingue',
      desc:"Oltre 500 traduttori madrelingua specializzati nei settori industriali. Strumenti CAT di ultima generazione per garantire precisione terminologica globale.",
      tags:['500+ Native Pros','CAT Tools Support','ISO 17100 Verified','Technical Glossaries']},
    {slug:'cataloghi-ricambi',title:'Cataloghi Ricambi',
      desc:"Trasformiamo i vostri cataloghi cartacei in potenti strumenti di vendita digitale. Gestione ricambi interattiva per facilitare l'ordine corretto e il service post-vendita.",
      tags:['Interactive Parts','After Sales Portals','Spare Parts Strategy','Cloud Management']},
    {slug:'soluzioni-creative',title:'Soluzioni Creative',
      desc:"Studiamo e creiamo soluzioni di comunicazione per il settore industriale. Dai loghi alle schede prodotto, curiamo ogni dettaglio per una comunicazione di alto impatto.",
      tags:['Industrial Branding','Web Design','Depliants & Brochures','Event Strategy']},
    {slug:'foto-video-training',title:'Foto & Video Training',
      desc:"Supporti multimediali per meeting e istruzioni di montaggio. Shooting industriali e video training specialistici per trasferire la conoscenza in maniera visiva ed efficace.",
      tags:['Industrial Shooting','Video Commercials','Montaggio Istruzioni','Multimedia Support']},
    {slug:'modellazione-rendering',title:'Modellazione & Rendering',
      desc:"Dalla modellazione 3D al rendering fotorealistico. Lo strumento migliore per vendere i tuoi macchinari prima ancora di averli costruiti.",
      tags:['Technical Illustration','3D Modelling','Computer Grafica HQ','VR Ready Assets']},
    {slug:'soluzioni-software',title:'Soluzioni Software 2.0',
      desc:"Analizziamo le vostre esigenze e realizziamo soluzioni software su misura per la gestione della documentazione tecnica. Efficienza digitale per l'industria moderna.",
      tags:['Project Configurator','Technical Web Apps','Process Automation','Cloud Distribution']}
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
      card.style.backgroundImage="url('img/services/"+s.slug+".jpg')";
      card.innerHTML='<div class="sc-num">'+num+'</div>'+
        '<h3 class="sc-title">'+esc(s.title)+'</h3>'+
        '<p class="sc-desc">'+esc(s.desc)+'</p>'+
        '<div class="sc-tags">'+s.tags.map(t=>'<span class="sc-tag">'+esc(t)+'</span>').join('')+'</div>'+
        '<div class="sc-cta">Dettagli servizio <span>→</span></div>'+
        '<div class="sc-link-icon">↗</div>';
      svcTrack.appendChild(card);
      const item=document.createElement('a');
      item.className='svcMobileItem';
      item.dataset.service=s.slug;
      item.style.backgroundImage="url('img/services/"+s.slug+".jpg')";
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
        // 1px di scroll = 1px di corsa orizzontale: lo stage è alto quanto viewport + corsa
        svcTravel=Math.max(1,svcTrack.scrollWidth-innerWidth);
        svcStage.style.height=(innerHeight+svcTravel)+'px';
      }
      function renderSvc(p){
        if(!svcActive) return;
        svcTrack.style.transform='translateX('+(-p*svcTravel).toFixed(1)+'px)';
        if(svcProgressBar) svcProgressBar.style.width=(p*100).toFixed(2)+'%';
        if(svcCounter) svcCounter.textContent=(Math.min(SERVICES.length,Math.round(p*(SERVICES.length-1))+1))+' / '+String(SERVICES.length).padStart(2,'0');
        // spotlight: piena opacità al centro del viewport, attenuata ai lati; l'hover vince sempre
        const viewCenter=innerWidth/2;
        svcCards.forEach(card=>{
          if(card._hovered){ card.style.opacity='1'; return; }
          const r=card.getBoundingClientRect();
          const dist=Math.abs(r.left+r.width/2-viewCenter);
          const k=Math.max(0,1-dist/(innerWidth*0.55));
          card.style.opacity=(0.28+k*0.72).toFixed(2);
        });
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
      const START=.32, END=.66, STEPS=qCount-1, stepW=(END-START)/STEPS;
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
      const paperRise=smooth(sub(s,0,.08));
      if(qualityPaper) qualityPaper.style.transform='translateY('+((1-paperRise)*101).toFixed(2)+'%)';
      if(qualityBanner) qualityBanner.style.transform='translateX('+lerp(120,0,smooth(sub(s,.05,.13))).toFixed(2)+'%)';
      if(qualityH2){
        const headIn=smooth(sub(s,.10,.19));
        qualityH2.style.clipPath='inset(0 '+((1-headIn)*100).toFixed(1)+'% 0 0)';
        qualityH2.style.transform='scale('+lerp(1.06,1,headIn).toFixed(3)+')';
      }
      if(qualityP) qualityP.style.opacity=smooth(sub(s,.20,.25)).toFixed(3);
      if(qualityIntro){
        const introOut=smooth(sub(s,.25,.31)); // il titolo iniziale si ritrae tramite crop
        qualityIntro.style.clipPath='inset(0 0 0 '+(introOut*100).toFixed(1)+'%)';
      }

      // ---- scena 2 — metodo [.30,.74]: la maschera dei codici e la definizione entrano con una semplice
      // dissolvenza (non un crop: un crop orizzontale relativo al viewport ritarderebbe la comparsa di un
      // testo ancorato a sinistra, creando un vuoto), poi riga eyebrow, poi DQ/IQ/OQ/PQ una alla volta con
      // hold leggibile; infine il metodo esce tramite crop, come richiesto, prima della tracciabilità ----
      if(qualityCodeMaskEl) qualityCodeMaskEl.style.opacity=smooth(sub(s,.26,.31)).toFixed(3);
      if(qualityDefinition) qualityDefinition.style.opacity=smooth(sub(s,.26,.31)).toFixed(3);
      if(qualityEyebrow) qualityEyebrow.style.opacity=smooth(sub(s,.29,.34)).toFixed(3);
      if(qualityCodeStrip){
        const pos=qualityCodePos(s);
        qualityCodeStrip.style.transform='translateY(-'+(pos*(100/qCount)).toFixed(2)+'%)';
        setQualityDefinition(clamp(Math.round(pos),0,qCount-1));
      }
      if(qualityMethod){
        const methodOut=smooth(sub(s,.67,.74)); // il metodo esce tramite crop
        qualityMethod.style.clipPath='inset(0 0 0 '+(methodOut*100).toFixed(1)+'%)';
      }

      // ---- scena 3 — tracciabilità [.61,.87]: entra dal basso come un foglio tecnico (solo translateY,
      // niente ombra/card) — la risalita parte presto e generosa, così è già ben visibile quando il metodo
      // sparisce (evita qualunque vuoto nel mezzo); il testo domina, poi metadati e firma dopo una pausa ----
      if(qualityRecord) qualityRecord.style.transform='translateY('+lerp(100,0,smooth(sub(s,.61,.76))).toFixed(2)+'%)';
      if(qualityMeta) qualityMeta.style.opacity=smooth(sub(s,.80,.87)).toFixed(3);

      // ---- scena 4 — chiusura [.90,1]: un campo nero (il layer stesso) sale sopra la carta, poi titolo,
      // poi CTA — nessun box pieno, solo testo ----
      if(qualityFinal) qualityFinal.style.transform='translateY('+lerp(100,0,smooth(sub(s,.90,.96))).toFixed(2)+'%)';
      if(qualityFinalH) qualityFinalH.style.opacity=smooth(sub(s,.94,.98)).toFixed(3);
      if(qualityCta) qualityCta.style.opacity=smooth(sub(s,.97,1.0)).toFixed(3);
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
  // Editoriale, non feed social e non griglia di card. A differenza delle sezioni precedenti, qui la lista
  // (newsList) nasce vuota in HTML e va costruita da JS: la costruzione gira SEMPRE, anche in reduced-motion,
  // perché è lì che vive anche il fallback statico (immagine+estratto+CTA per ogni articolo, non solo per
  // quello attivo — senza scroll il pannello condiviso a destra non avrebbe senso). Solo la regia scroll-driven
  // (renderNews) resta dietro il guard !reduce, come per le altre sezioni.
  const newsSection=$('newsSection'), newsSticky=$('newsSticky');
  if(newsSection && newsSticky){
    const NEWS_ITEMS=[
      {number:'01',category:'ECOSISTEMA',title:'DALLA DOCUMENTAZIONE AL DATO CONNESSO.',
        excerpt:'Strumenti, matricole e contenuti tecnici possono restare allineati lungo tutto il ciclo di vita della macchina.',
        image:'img/news/news_01.jpg',cta:'LEGGI L’INSIGHT'},
      {number:'02',category:'METODO',title:'UN MANUALE NON È MAI SOLO UN MANUALE.',
        excerpt:'Progettazione, immagini, terminologia e validazione: la qualità nasce quando ogni parte parla la stessa lingua.',
        image:'img/news/news_02.jpg',cta:'LEGGI L’INSIGHT'},
      {number:'03',category:'INNOVAZIONE',title:'VEDERE PRIMA. DECIDERE MEGLIO.',
        excerpt:'Rendering, illustrazioni e contenuti multimediali rendono comprensibile un prodotto prima ancora della sua consegna.',
        image:'img/news/news_03.jpg',cta:'LEGGI L’INSIGHT'}
    ];
    const newsListEl=$('newsList'), newsImage=$('newsImage'), newsMeta=$('newsMeta'),
          newsExcerpt=$('newsExcerpt'), newsCta=$('newsCta');

    // ogni riga porta titolo/categoria/numero per la vista scroll-driven e, nascosto via CSS (mostrato
    // solo in reduced-motion), il proprio fallback statico completo — stesso principio di data-def per Qualità
    const newsListItems=NEWS_ITEMS.map((item,i)=>{
      const row=document.createElement('div');
      row.className='newsListItem'+(i===0?' active':'');
      row.dataset.i=i;
      row.innerHTML=
        '<div class="newsListHead"><span class="newsListNum">'+item.number+'</span>'+
        '<span class="newsListCategory">'+item.category+'</span></div>'+
        '<h3>'+item.title+'</h3>'+
        '<div class="newsListStatic">'+
          '<img src="'+item.image+'" alt="">'+
          '<p>'+item.excerpt+'</p>'+
          '<button type="button" class="newsCtaStatic" data-news-index="'+i+'">'+item.cta+' <span>→</span></button>'+
        '</div>';
      if(newsListEl) newsListEl.appendChild(row);
      return row;
    });

    // pannello condiviso già coerente con il primo articolo dal primo frame: nessun crossfade spurio
    if(newsImage) newsImage.src=NEWS_ITEMS[0].image;
    if(newsMeta) newsMeta.textContent=NEWS_ITEMS[0].category;
    if(newsExcerpt) newsExcerpt.textContent=NEWS_ITEMS[0].excerpt;
    if(newsCta) newsCta.dataset.newsIndex=0;

    if(!reduce){
      let newsActiveIdx=0;
      function setActiveNews(idx){
        if(idx===newsActiveIdx) return;
        newsActiveIdx=idx;
        newsListItems.forEach((el,i)=>el.classList.toggle('active',i===idx));
        if(newsImage){
          newsImage.style.clipPath='inset(0 0 0 100%)'; // crop orizzontale, non fade lungo
          setTimeout(()=>{
            newsImage.src=NEWS_ITEMS[idx].image;
            void newsImage.offsetWidth;
            newsImage.style.clipPath='inset(0 0 0 0%)';
          },480);
        }
        if(newsMeta) newsMeta.style.clipPath='inset(0 0 100% 0)';
        if(newsExcerpt) newsExcerpt.style.clipPath='inset(0 0 100% 0)';
        setTimeout(()=>{
          if(newsMeta){ newsMeta.textContent=NEWS_ITEMS[idx].category; void newsMeta.offsetWidth; newsMeta.style.clipPath='inset(0 0 0% 0)'; }
          if(newsExcerpt){ newsExcerpt.textContent=NEWS_ITEMS[idx].excerpt; void newsExcerpt.offsetWidth; newsExcerpt.style.clipPath='inset(0 0 0% 0)'; }
        },190);
        if(newsCta) newsCta.dataset.newsIndex=idx;
      }

      const newsIntro=$('newsIntro'),
            newsBanner=newsIntro&&newsIntro.querySelector('.newsBanner'),
            newsH2=newsIntro&&newsIntro.querySelector('h2'),
            newsP=newsIntro&&newsIntro.querySelector('p'),
            newsEditorial=$('newsEditorial'),
            newsVisualEl=$('newsVisual'), newsDetailEl=$('newsDetail'),
            newsFinal=$('newsFinal'), newsFinalP=newsFinal&&newsFinal.querySelector('p'),
            linkedinCta=newsFinal&&newsFinal.querySelector('.linkedinCta');

      function renderNews(s){
        // ---- scena 1 — apertura [.00,.35]: rallentata su richiesta (il titolo non faceva in tempo a essere
        // letto — l'uscita partiva addirittura prima che la maschera del titolo finisse di aprirsi). Ora:
        // banner, poi titolo con rivelazione più lenta, poi sottotitolo, poi una pausa di lettura vera e
        // propria (nessuna animazione tra .25 e .30) prima che la scena si ritragga tramite crop. La sezione
        // ha più altezza totale (500vh, prima 380vh) per dare fisicamente più scroll a questa sola scena:
        // scena 2 e 3 mantengono lo stesso ritmo assoluto di prima (le soglie sono spostate in avanti della
        // stessa quantità di scroll aggiunta qui, non riscalate) ----
        if(newsBanner) newsBanner.style.transform='translateX('+lerp(120,0,smooth(sub(s,.02,.08))).toFixed(2)+'%)';
        if(newsH2){
          const headIn=smooth(sub(s,.06,.18));
          newsH2.style.clipPath='inset(0 '+((1-headIn)*100).toFixed(1)+'% 0 0)';
          newsH2.style.transform='scale('+lerp(1.06,1,headIn).toFixed(3)+')';
        }
        if(newsP) newsP.style.opacity=smooth(sub(s,.20,.25)).toFixed(3);
        if(newsIntro){
          const introOut=smooth(sub(s,.30,.35));
          newsIntro.style.clipPath='inset(0 0 0 '+(introOut*100).toFixed(1)+'%)';
        }

        // ---- scena 2 — editoriale [.364,.784]: lista/immagine/dettaglio entrano in dissolvenza (overlap con
        // l'uscita dell'apertura, nessun vuoto — stessa lezione già imparata per Cap.04), poi l'indice attivo
        // avanza 0->1->2 in tre zone uguali; il cambio di articolo è gestito via classi CSS (transizione,
        // non valore continuo legato allo scroll). Soglie invariate in vh rispetto a prima, solo spostate
        // in avanti per lasciare posto alla scena 1 più lunga ----
        const editIn=smooth(sub(s,.322,.364));
        if(newsListEl) newsListEl.style.opacity=editIn.toFixed(3);
        if(newsVisualEl) newsVisualEl.style.opacity=editIn.toFixed(3);
        if(newsDetailEl) newsDetailEl.style.opacity=editIn.toFixed(3);

        const zone=(.784-.364)/3;
        setActiveNews(clamp(Math.floor((s-.364)/zone),0,2));

        if(newsEditorial){
          const editOut=smooth(sub(s,.784,.826));
          newsEditorial.style.clipPath='inset(0 0 0 '+(editOut*100).toFixed(1)+'%)';
        }

        // ---- scena 3 — chiusura: il nero sale presto e generoso, già completamente assestato prima che
        // l'editoriale finisca di sparire (stesso principio anti-vuoto già verificato per Cap.04), poi
        // invito e CTA LinkedIn — soglie invariate in vh rispetto a prima, solo spostate in avanti ----
        if(newsFinal) newsFinal.style.transform='translateY('+lerp(100,0,smooth(sub(s,.686,.798))).toFixed(2)+'%)';
        if(newsFinalP) newsFinalP.style.opacity=smooth(sub(s,.805,.833)).toFixed(3);
        if(linkedinCta) linkedinCta.style.opacity=smooth(sub(s,.826,.868)).toFixed(3);
      }

      function readScrollN(){
        const denom=Math.max(1,newsSection.offsetHeight-innerHeight);
        renderNews(clamp((scrollY-newsSection.offsetTop)/denom,0,1));
      }
      addEventListener('scroll',readScrollN,{passive:true});
      readScrollN();
    }
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
