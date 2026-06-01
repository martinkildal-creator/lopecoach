# Løpecoach — sett opp gratis Strava-synk

Dette er en komplett treningsapp med automatisk Strava-synk. Den kjører helt gratis på Vercel.
Engangsoppsettet tar ca. 15 minutter. Etterpå dukker øktene dine opp av seg selv.

```
lopecoach/
├── index.html          ← selve appen (kan også åpnes direkte i nettleser uten synk)
├── api/
│   └── strava.js       ← håndterer Strava-innlogging (gratis serverfunksjon)
└── README.md           ← denne fila
```

## Du trenger
- En gratis konto på **vercel.com**
- En gratis konto på **github.com** (enkleste vei til Vercel)
- Din Strava-konto

---

## Steg 1 — Registrer en gratis Strava-app (5 min)
1. Gå til **https://www.strava.com/settings/api**
2. Fyll ut:
   - **Application Name:** Løpecoach (eller hva du vil)
   - **Category:** Training
   - **Website:** kan være hva som helst, f.eks. `https://example.com`
   - **Authorization Callback Domain:** la stå `localhost` foreløpig — vi endrer den i steg 4
3. Klikk **Create**. Du får nå:
   - **Client ID** (et tall)
   - **Client Secret** (en lang streng) — denne er hemmelig, ikke del den

## Steg 2 — Legg koden på GitHub (3 min)
1. Lag et nytt, tomt repository på github.com (f.eks. `lopecoach`).
2. Last opp `index.html`, mappen `api/` og `README.md` (dra og slipp i GitHub-nettsiden, eller bruk git).

## Steg 3 — Deploy på Vercel (3 min)
1. Logg inn på **vercel.com** med GitHub.
2. **Add New → Project → Import** repoet ditt.
3. Ikke endre noe i bygg-innstillingene — klikk **Deploy**.
4. Du får en adresse, f.eks. `https://lopecoach-xxxx.vercel.app`.

## Steg 4 — Koble nøklene til (2 min)
1. I Vercel: **Project → Settings → Environment Variables**. Legg til:
   - `STRAVA_CLIENT_ID` = ditt Client ID
   - `STRAVA_CLIENT_SECRET` = ditt Client Secret
2. **Redeploy** prosjektet (Deployments → ⋯ → Redeploy) så variablene tas i bruk.
3. Gå tilbake til **https://www.strava.com/settings/api** og sett
   **Authorization Callback Domain** til domenet ditt **uten https://**, f.eks.
   `lopecoach-xxxx.vercel.app`. Lagre.

## Steg 5 — Bruk den
1. Åpne Vercel-adressen din.
2. Klikk **Koble til Strava** øverst → godkjenn.
3. Du sendes tilbake, og øktene synkroniseres automatisk. Trykk **Synk nå** når du vil hente nye.

Garmin: hvis du allerede har koblet Garmin Connect → Strava (de fleste har), kommer Garmin-øktene
automatisk inn via Strava. Trenger du noe Strava ikke har, kan du fortsatt dra inn GPX/TCX manuelt.

---

## Uten deploy
Du kan også bare åpne `index.html` rett i nettleseren. Da virker alt unntatt auto-synk —
du kan logge økter manuelt og importere Strava-arkiv (`activities.csv`) eller GPX/TCX-filer.

## Personvern
All treningsdata lagres lokalt i din egen nettleser (localStorage). Strava-nøklene ligger
trygt som miljøvariabler på din egen Vercel-konto og sendes aldri til nettleseren.
Dette er ment som en personlig app for deg.
