# SR Events – E-postassistent (demo)

En liten Next.js-app som demonstrerer en AI-drevet e-postassistent for SR Events.
Bruker Claude Sonnet 4.6 via Anthropic API med en omfattende systemprompt
(`src/lib/system-prompt.ts`) basert på Christians egen agentdokumentasjon.

## Kjør lokalt

1. Opprett `.env.local` ved å kopiere `.env.example` og legge inn din
   Anthropic API-nøkkel:
   ```bash
   cp .env.example .env.local
   # rediger .env.local og lim inn nøkkelen fra console.anthropic.com
   ```
2. Installer (allerede gjort hvis du kjørte `npm install`):
   ```bash
   npm install
   ```
3. Start dev-serveren:
   ```bash
   npm run dev
   ```
4. Åpne [http://localhost:3000](http://localhost:3000).

## Deploy til Vercel

1. Lag nytt repo på GitHub og push koden dit.
2. Gå til [vercel.com/new](https://vercel.com/new), importer repoet.
3. Under "Environment Variables": legg inn `ANTHROPIC_API_KEY` med
   nøkkelen fra Anthropic Console.
4. Klikk Deploy.

Etter deploy får du en lenke (f.eks. `sr-events-agent.vercel.app`) som
du kan sende til Christian.

## Endre systemprompten

Hele instruks-settet ligger i [`src/lib/system-prompt.ts`](src/lib/system-prompt.ts).
Endrer du innholdet der, oppdaterer du agentens oppførsel. Bruker prompt
caching, så små endringer er rimelig — store endringer invalideres cachen
og koster mer på første spørring.

## Endre eksempler

Eksempel-knappene øverst på siden defineres i
[`src/lib/examples.ts`](src/lib/examples.ts).
