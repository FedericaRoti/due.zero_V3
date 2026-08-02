# Nuovo sito Due.Zero — cose da chiedere prima della produzione

Il dominio resta `duezero.eu`. Ogni voce indica cosa manca oggi in questa base (`~/Projects/duezero-v3`, nata dal prototipo `pitch/` di Due.ZeroV3 e ora indipendente).

## Cinque domande per il programmatore interno

1. **Deploy** — come viene pubblicato oggi il sito sul server? Quando andrà su il nuovo, conferma che `DueZeroProject/`, `Gestori/`, `mappa-embed.html` e le altre cartelle applicative non si toccano. (Le app restano sul server: il nuovo sito le usa solo via link/iframe, niente entra nel nostro repo.)
2. **Form** — il form attuale invia email dal vostro ASP.NET (postback + reCAPTCHA): puoi esporre lo stesso invio come endpoint per il form del nuovo sito?
3. **Mappa** — quanti caricamenti/mese vedi nella dashboard Mapbox e che piano avete? (Prima di valutare alternative tipo MapLibre: se siete nel piano gratuito, il problema costi non esiste. I dati macchine arrivano dal vostro `GET_Elenco_Pubblicazioni_Mappa.ashx` e restano invariati con qualsiasi libreria.)
4. **Redirect** — i 301 dal vecchio sito al nuovo si gestiscono via `web.config` su IIS: li fai tu o li prepariamo noi?
5. **Accessi** — Google Search Console e eventuale Analytics: chi li ha?

## Bloccanti (senza queste non si va in produzione)

- [ ] **Form contatti** — il sito attuale (`contatti.aspx`, verificato) invia già lato server: postback ASP.NET con reCAPTCHA, l'email parte dal loro backend. Il nostro form invece apre un `mailto:` precompilato verso info@duezero.eu (funziona ma dipende dal client email dell'utente). Da chiedere:
  1. **chi mantiene il codice ASP.NET del sito attuale?** La strada più coerente è riusare lo stesso invio server-side per il nuovo form (endpoint che riceve i campi e spedisce l'email) — l'infrastruttura c'è già;
  2. se nessuno lo mantiene: servizio esterno tipo Formspree/Web3Forms (funziona su statico, da verificare GDPR, piccolo costo);
  3. ultima spiaggia: tenere il `mailto:`.
  In ogni caso: a quale indirizzo devono arrivare le richieste, e serve la checkbox consenso privacy.
- [ ] **Privacy e Cookie policy** — URL o testi. Obbligatorie: il form raccoglie nome ed email. Chi le redige (legale/consulente)? Nel footer oggi sono segnaposto non cliccabili. Al form servirà anche la checkbox di consenso.
- [ ] **Hosting e DNS** — dove verrà pubblicato il nuovo sito quando sostituirà il vecchio? Chi gestisce il DNS di duezero.eu? Serve un referente tecnico (GitHub Pages è solo anteprima).
- [ ] **Machine Map e 2.0 Project** — il nuovo sito **non deve costruire né gestire nulla** di queste due cose: si limita a *incorporare* la mappa (iframe su `mappa-embed.html`) e a *linkare* la pagina di login di 2.0 Project. Tutto ciò che sta dietro (dati, login, app) resta responsabilità loro. L'unico rischio è che, sostituendo il vecchio sito sullo stesso dominio, quelle URL smettano di rispondere. Da chiedere:
  1. chi gestisce il server / come sono deployate le app (referente tecnico o fornitore);
  2. conferma che il deploy del nuovo sito non toccherà `DueZeroProject/`, `mappa-embed.html`, `Gestori/` e le altre cartelle applicative;
  3. se restano ai percorsi attuali → nel nuovo sito basta puntare a `www.duezero.eu/...` (senza `www` c'è un redirect 301 inutile);
  4. se si vuole un URL più pulito (es. `project.duezero.eu`) → configurazione IIS/DNS, da decidere prima del go-live.

- [ ] **Mappa: costi Mapbox e alternative** (verificato sul sorgente attuale) — la mappa usa Mapbox GL JS v2.2 (stile `dark-v10`, token pubblico nel sorgente) ma **i dati delle macchine arrivano dal loro backend** (`Gestori/GET_Elenco_Pubblicazioni_Mappa.ashx` restituisce il GeoJSON): la parte "numeri che si aggiornano" è loro e resta identica con qualsiasi libreria. Mapbox fattura sui caricamenti mappa. Da chiedere: quanti caricamenti/mese fanno oggi (dashboard Mapbox) e se il piano gratuito basta. Se vogliono azzerare il costo: **MapLibre GL** (fork open source di Mapbox GL, API quasi identica → migrazione contenuta) + tile gratuite/economiche (OpenFreeMap, MapTiler free tier) — soglie e prezzi da verificare sulle docs al momento della decisione. Google Maps già escluso da loro per costi.

## Contenuti

- [ ] Immagini definitive (scelta in corso): hero, eco_project, eco_hyperparts, 3 news. Chiedere anche gli originali ad alta risoluzione, non solo i JPEG già compressi.
- [ ] Logo in vettoriale (SVG) — oggi c'è solo `DueZero_logo.png`.
- [ ] Favicon ufficiale, o via libera a ricavarla dal logo.
- [ ] URL della pagina LinkedIn aziendale — la CTA "Seguici su LinkedIn" oggi non punta a niente.
- [ ] Le 3 news sono placeholder: testi reali? Chi le aggiornerà e ogni quanto? (decide se bastano file statici o serve un minimo di gestione contenuti)
- [ ] **Servizi** — numero definitivo (oggi 8, probabilmente meno) e titoli ufficiali. Ogni servizio avrà una pagina interna dedicata: servono i testi. La sezione in homepage verrà ridisegnata su una bozza diversa già proposta (da riprendere). Gli slug/URL delle pagine vanno congelati appena c'è l'elenco: sono URL pubblici, cambiarli dopo costa redirect.
- [ ] È prevista una versione inglese/multilingua? Cambia struttura, SEO e hreflang.
- [ ] Dati societari completi per il footer: capitale sociale, REA, PEC (la P.IVA c'è già).

## SEO / GEO / migrazione

- [ ] Elenco delle URL del sito attuale (o accesso a Google Search Console) per impostare i redirect 301 verso le nuove pagine e non perdere il posizionamento.
- [ ] Accessi esistenti: Search Console, Analytics, Google Business Profile.
- [ ] Quale analytics per il nuovo sito (GA4, Plausible, nessuno)? Determina se serve il cookie banner.
- [ ] Meta title/description: c'è un testo di presentazione "ufficiale" approvato dal marketing? Utile anche per schema.org Organization (GEO).
- [ ] Dati fattuali per structured data: anno di fondazione (2008?), certificazioni reali, settori serviti, numero sedi.
