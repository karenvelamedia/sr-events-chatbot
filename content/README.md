# Innhold til chatboten

Her ligger alt som styrer hvordan chatboten oppfører seg og hva den vet.
**Du trenger ikke kunne kode** — alt er vanlig tekst.

## Filer du kan redigere

### `system-prompt.md`
Hovedinstruksene til chatboten. Inneholder:
- Hvem chatboten er og hva den skal hjelpe med
- Tone og stil
- Tørrhetsdata: kontaktinfo, teltstørrelser, leveringsområder, priser
- Eksempler på gode svar

**Når du bør endre denne:** Hvis priser, adresse, teltstørrelser, eller måten chatboten skal svare på endrer seg.

### `chat-instructions.md`
Ekstra regler som gjelder **bare** for live chat på nettsiden (ikke epost).
Inneholder:
- Hvor korte svarene skal være
- Hvilke 9 spørsmål boten må samle inn før den avslutter
- Hva den skal si når kunden gir kontaktinfo

**Når du bør endre denne:** Hvis du vil endre rekkefølgen på spørsmål, justere tonen i chatten, eller endre når boten skal gi prisramme.

## Slik redigerer du

1. Klikk på filen du vil endre (f.eks. `system-prompt.md`)
2. Klikk på blyant-ikonet oppe til høyre ("Edit this file")
3. Gjør endringene dine
4. Skroll ned, skriv en kort beskrivelse av hva du endret
5. Klikk "Commit changes"

Endringene går live på nettsiden innen 1–2 minutter automatisk.

## Hvis noe går galt

Alle endringer er sporet. Du kan alltid se hva som er endret, og rulle tilbake til en tidligere versjon ved å gå inn på "History" på filen.
