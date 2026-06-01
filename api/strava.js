// Vercel serverless function: /api/strava
// Handles Strava OAuth + activity fetching so the client secret never reaches the browser.
// Set two environment variables in Vercel: STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET

export default async function handler(req, res) {
  const action = req.query.action;
  const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
  const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    res.status(500).json({ error: 'Mangler STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET i miljøvariablene' });
    return;
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const origin = `${proto}://${host}`;
  const redirectUri = `${origin}/api/strava?action=callback`;

  try {
    // 1) Send the user to Strava's login/consent screen
    if (action === 'authorize') {
      const url = 'https://www.strava.com/oauth/authorize'
        + `?client_id=${CLIENT_ID}`
        + '&response_type=code'
        + `&redirect_uri=${encodeURIComponent(redirectUri)}`
        + '&approval_prompt=auto'
        + '&scope=activity:read_all';
      res.writeHead(302, { Location: url });
      res.end();
      return;
    }

    // 2) Strava redirects back here with ?code=... → exchange for tokens
    if (action === 'callback') {
      const code = req.query.code;
      if (!code) { res.status(400).send('Mangler code fra Strava'); return; }
      const r = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code, grant_type: 'authorization_code' })
      });
      const data = await r.json();
      const params = new URLSearchParams({
        access_token: data.access_token || '',
        refresh_token: data.refresh_token || '',
        expires_at: String(data.expires_at || '')
      });
      // Hand the tokens back to the front-end via the URL hash, then it stores them locally.
      res.writeHead(302, { Location: `${origin}/#${params.toString()}` });
      res.end();
      return;
    }

    // 3) Refresh an expired access token
    if (action === 'refresh') {
      const refresh_token = req.query.refresh_token;
      const r = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: 'refresh_token', refresh_token })
      });
      res.status(200).json(await r.json());
      return;
    }

    // 4) Proxy the activity list (avoids browser CORS issues)
    if (action === 'activities') {
      const token = req.query.token;
      const page = req.query.page || 1;
      const r = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=200&page=${page}`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      const body = await r.json();
      res.status(r.status).json(body);
      return;
    }

    // 5) Proxy one activity's full detail (description + laps), on demand
    if (action === 'detail') {
      const token = req.query.token;
      const id = req.query.id;
      const r = await fetch(`https://www.strava.com/api/v3/activities/${id}?include_all_efforts=false`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      const body = await r.json();
      res.status(r.status).json(body);
      return;
    }

    res.status(400).json({ error: 'Ukjent action' });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
