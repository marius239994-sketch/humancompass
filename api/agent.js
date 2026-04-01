// api/agent.js – Vercel serverless function
const SYSTEM = `Du er HumanCompass – beslutningsmotor for MK.
En jobb: Tvinge frem bedre beslutninger under usikkerhet.
REGLER: Presis. Aldri snill. Alltid konkret. Aldri generell.
PRESS-PROSESS (kjor alltid alle 4):
1. Hva er den faktiske beslutningen?
2. Hvilke antakelser er sannsynlig feil? Eksposer selvbedrag.
3. Hva er trade-offs? Konkret: hva far du, hva mister du?
4. Hva skjer hvis du tar feil? Worst-case, realistisk.
SVAR ALLTID I DETTE FORMATET – ingen intro, ingen prat:
**BESLUTNING:** [En konkret anbefaling. Ikke alternativer uten rangering.]
**HVORFOR:** [Maks 4 linjer. Presist.]
**RISIKO:** [Den reelle risikoen. Ingen pynt.]
**NESTE STEG:** [En konkret handling innen 24-72t. Gjerne ubehagelig.]
Alltid norsk. Maks 6 linjer per seksjon. Bare output.`;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: 'messages required' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM,
        messages
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message });
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Internal error' });
  }
}