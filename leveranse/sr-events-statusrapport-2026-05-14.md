# SR Events – AI-assistent: Status og avklaringer

**Til:** Christian, SR Events
**Fra:** Karen, Vela Media
**Dato:** 14. mai 2026

---

## Hvor vi står

Jeg har bygget et førsteutkast av AI-assistenten basert på agentdokumentasjonen du sendte meg. Den finnes i to varianter (epost-utkast og chat på nett) som bruker akkurat de samme reglene fra dokumentet ditt – samme «hjerne», to grensesnitt.

Før jeg deployer en testlenke til deg, har jeg noen punkter jeg trenger din avklaring på. Det er ting jeg har støtt på underveis som krever ditt valg – ikke noe vi kan løse uten deg. Når du har svart på det som står lenger ned, finjusterer jeg den og sender deg en lenke å klikke på.

Som vedlegg får du også en logg over 26 testscenarioer jeg har kjørt i chat-varianten. Den viser deg konkret hvordan agenten håndterer alt fra «trenger telt» til dialekt, edge cases, slushmaskin-forespørsler og kunder utenfor leveringsområdet.

---

## Hva som er bygget så langt

**Epost-utkast-modus**
Lim inn en kundeforespørsel → få et komplett e-postsvar tilbake, klar til å sendes. Dette ligner på det du har i Outlook i dag, men bygget rundt dine egne regler fra dokumentet (anti-fluff, korrekt lageradresse, riktig teltstørrelse fra tabellen, aldri dikt opp noe).

**Chat-modus**
En live chat på en webside, slik den ville sett ut hvis vi senere bygger en widget på nettsiden din. Den stiller ett spørsmål av gangen i stedet for å liste alt på en gang, og samler info bit for bit til den har nok til at du kan lage tilbud.

Begge bruker samme regel-sett. Hvis du endrer instruksjonene ett sted, oppdateres begge.

---

## Hva som er testet

Hele agentdokumentasjonen din er lagt inn som systemprompt, og jeg har testet at den følger reglene strengt. Noen høydepunkter fra de 26 testscenarioene (full logg i vedlegget):

**Det jeg er fornøyd med:**

- **Lageradressen er alltid riktig** – Dromnesvegen 11, 6699 Kjørsvikbugen, med Google Maps-lenken. Den henter aldri en adresse fra kundens signatur eller dikter den opp.
- **Anti-fluff fungerer** – ingen «takk for at du tok deg tid og for alle de gode spørsmålene», bare rett på sak.
- **Riktig teltstørrelse fra tabellen** – 50 gjester → 9x9 meter, 80 gjester → 9x15 meter osv. Den runder opp med margin slik regelen sier.
- **Den lyver ikke når den ikke vet** – på spørsmål om priser, avbestillingsregler eller annet den ikke har dokumentert, sender den kunden videre til deg i stedet for å finne på noe.
- **Den takler dialekt og edge cases** – fra «Æ treng ett telt» til «har dere slushmaskin». Holder seg innenfor det den vet.
- **Den driver samtalen fremover** – stiller alltid et oppfølgingsspørsmål så kunden ikke blir stående.

**Det som skiller den fra det du har nå:**
Agenten har én sentral instruks som styrer både epost og chat. Hvis vi finjusterer et sted (f.eks. hvordan vi spør om budsjett), oppdateres begge automatisk. Du slipper å vedlikeholde to ulike sett.

---

## Spørsmål jeg trenger svar på

Her er det jeg har lurt på underveis. Noen kan besvares kort, andre vil kanskje kreve at vi tar en prat. Bare svar på det som er klart for deg – resten kan vi ta sammen.

### 1. Hvor proaktiv skal chatten være med budsjett?

Eksempel fra test: Kunde ønsket telt til firmakickoff i Molde med budsjett på 30 000. Dine interne prisrammer sier Romsdal ligger på 50–75 000.

Skal chatten:
- **A:** Bare ta imot tallet, sende videre til deg, du forklarer i tilbudet
- **B:** Si fra med en gang at slike oppdrag vanligvis ligger 50–75 000 og spørre om kunden likevel vil ha et tilbud
- **C:** Notere internt at det virker lavt, men avslutte samtalen normalt

### 2. Har du en prisstruktur jeg kan legge inn?

For at chatten skal gi en ca prisramme i samtalen, må jeg ha en grov matrise: **leveringssone × teltstørrelse × rigging (dugnad/full)**. Har du noe sånt internt jeg kan bruke? Hvis ikke, så går vi videre uten – chatten kan henvise alle prisspørsmål til deg.

### 3. Hva regner du som «privat kunde»?

Reglene i dokumentet om prisforankring og alternativløsninger over 50k gjelder kun privatkunder. Hvordan vil du klassifisere disse?

- Idrettslag og foreninger
- Bygdelag, dugnadsgrupper, velforeninger
- Enkeltpersonforetak som arrangerer egen jubileumsfest
- Skoler, barnehager
- Kirker, menigheter

Et generelt prinsipp («alt som ikke er aksjeselskap regnes som privat», eller lignende) holder fint.

### 4. Tilbyr dere befaring før bestilling?

Hvis ja:
- Hvilke områder/avstander?
- Gratis eller fakturerbar?
- Hvordan bookes det – ringe deg, eller skal chatten foreslå det?

Hvis nei – si fra, så lærer jeg chatten å avvise det høflig.

### 5. Avbestillingsregler

Har du faste regler du kan dele med meg? Eksempelvis:
- Frist for kostnadsfri avbestilling
- Gebyr/prosent ved sen avbestilling
- Depositum (kreves det, hvor mye er ikke-refunderbart)
- Spesielle regler høysesong/lavsesong

Inntil videre henviser chatten alle slike spørsmål til deg, men hvis du har klare regler, så svarer den direkte og sparer deg telefoner.

### 6. Teltvalg når 9-meter og 12-meter overlapper

Eksempel: For 125 gjester (med 20 % margin = 150 minimum) passer både 9x24 meter (154 plasser) og 12x9 meter (151 plasser). Hvilket skal anbefales?

- Alltid 9-meter først hvis det passer?
- Alltid 12-meter (mer fleksibelt)?
- Avhenger av arrangementstype?

### 7. Skal chatten alltid foreslå tilleggsutstyr?

Når en kunde spør spesifikt om telt (ikke noe annet), skal chatten:
- Holde seg til det de spurte om
- Eller alltid spørre om bord/stoler/lys/varme/strøm i tillegg

Begge har fordeler. Hva foretrekker du?

### 8. Krever du alltid dato før prisestimat?

Hvis en kunde bare spør om pris uten å oppgi dato, skal chatten:
- Insistere på dato før den gir noen indikasjon
- Eller gi en grov ramme og spørre om dato underveis

### 9. Hva gjør chatten når den ikke kan svare?

I dag henviser den til ditt telefonnummer og e-post. Foretrekker du:
- **A:** «Ring Christian på 46286581 eller send e-post til christian@srevents.no»
- **B:** «Jeg sender dette videre, så hører du fra Christian»
- **C:** En kombinasjon

Hvis du vil ha **B** – hvordan ønsker du at videresendingen skjer praktisk? Skal chatten samle inn kontaktinfo og sende deg et sammendrag per epost automatisk?

### 10. Skal chatten flagge budsjett-mismatch til deg?

Hvis kundens budsjett ligger godt under prisrammen for området, skal chatten:
- Si det til kunden i samtalen
- Bare notere det internt og sende videre uten kommentar
- Spørre kunden om de likevel vil ha et tilbud før den sender videre

(Litt overlapp med spørsmål 1, men dette gjelder etter at all info er samlet.)

### 11. Logging av samtaler

Skal jeg lagre samtaleloggene et sted hvor du kan lese gjennom dem senere? Det kan være nyttig både for å forbedre instruksjonene over tid og for å oppdage trender (hva spør folk om, hva forsvinner, hva ble feil). Hvis ja: hvor lenge skal vi lagre dem, og hvem skal ha tilgang?

---

## Neste steg

Når du har svart på det du har et klart svar på (resten kan vi ta sammen), gjør jeg dette:

1. Finjusterer agenten basert på svarene
2. Tester den på nytt med oppdaterte regler
3. Legger den live på en testlenke du kan klikke på (Vercel)
4. Du tester selv – prøver å lure den, kaster vanskelige forespørsler på den
5. Vi justerer eventuelt videre, og diskuterer om/hvordan vi bygger inn løsningen på nettsiden din eller i Outlook

Hilsen
Karen, Vela Media
karen@velamedia.no
