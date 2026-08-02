# Nuovo sito Due.Zero — cose da chiedere prima della produzione

Il dominio resta `duezero.eu`. Ogni voce indica cosa manca oggi nel prototipo (`pitch/`).

## Bloccanti (senza queste non si va in produzione)

- [ ] **Form contatti** — oggi il form apre un `mailto:` verso info@duezero.eu con i campi precompilati: funziona, ma dipende dal client email dell'utente (su molti PC aziendali non è configurato). Da chiedere: a quale email devono arrivare le richieste, e quale soluzione preferiscono tra:
  1. tenere il `mailto:` (zero costi e zero infrastruttura, esperienza povera);
  2. servizio esterno tipo Formspree/Web3Forms (funziona su hosting statico, va verificato lato GDPR, piccolo costo);
  3. script sul server attuale (l'hosting è IIS/ASP.NET, lo supporta — ma serve chi lo scrive e lo mantiene).
- [ ] **Privacy e Cookie policy** — URL o testi. Obbligatorie: il form raccoglie nome ed email. Chi le redige (legale/consulente)? Nel footer oggi sono segnaposto non cliccabili. Al form servirà anche la checkbox di consenso.
- [ ] **Hosting e DNS** — dove verrà pubblicato il nuovo sito quando sostituirà il vecchio? Chi gestisce il DNS di duezero.eu? Serve un referente tecnico (GitHub Pages è solo anteprima).
- [ ] **Machine Map e 2.0 Project** — sono applicazioni che girano sul server attuale (`duezero.eu/mappa-embed.html` e `duezero.eu/DueZeroProject/Default.aspx`, ASP.NET su IIS). Il dominio resta lo stesso, quindi il punto non è "cambiare i link" ma capire la convivenza sul server: il nuovo sito sostituirà le pagine, le applicazioni devono continuare a rispondere. Da chiedere:
  1. chi gestisce il server / come sono deployate le app (referente tecnico o fornitore);
  2. se restano ai percorsi attuali → nel nuovo sito basta puntare a `www.duezero.eu/...` (il link senza `www` fa un redirect 301 inutile);
  3. se si vuole un URL più pulito (es. `project.duezero.eu`) → serve configurazione IIS/DNS, da decidere prima del go-live;
  4. conferma che il deploy del nuovo sito non toccherà le cartelle delle app sul server.

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
