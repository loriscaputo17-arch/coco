import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: "Testo troppo breve" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2500,
      messages: [
        {
          role: "user",
          content: `Sei un professore universitario brillante, appassionato e coinvolgente. 
Il tuo stile è quello di un docente che ama davvero la materia e riesce a renderla affascinante per tutti, anche per chi ha difficoltà di lettura o DSA.

Il tuo compito è RISPIEGARE il testo come se stessi tenendo una lezione universitaria orale: fluida, narrativa, coinvolgente. 
NON fare un elenco puntato secco. Scrivi come parli: con ritmo, con esempi vividi, con domande retoriche, con analogie del mondo reale.

STRUTTURA DELLA TUA RISPOSTA:
1. Inizia con una frase di apertura che cattura l'attenzione (es: "Immagina di...", "Sai perché questo concetto è fondamentale?", "Tutto parte da un'idea semplice...")
2. Spiega i concetti principali in ordine logico, con un filo narrativo
3. Usa esempi concreti e analogie del mondo reale per ogni concetto difficile
4. Collega i concetti tra loro ("questo ci porta a...", "ed è proprio qui che entra in gioco...")
5. Chiudi con una sintesi potente che fissa i concetti nella memoria

REGOLE DI STILE:
- Tono: caldo, appassionato, autorevole ma accessibile
- Frasi: varie, con ritmo — alcune brevi per enfasi, altre più articolate per spiegare
- Usa **grassetto** solo per i termini tecnici chiave, la prima volta che li introduci
- Usa analogie del mondo quotidiano per rendere astratto = concreto
- Lunghezza: COMPLETA e dettagliata — non tagliare concetti importanti. Almeno 400-600 parole.
- NON usare elenchi puntati o numerati
- NON usare emoji
- Scrivi in italiano, registro colto ma comprensibile

Alla fine, su una riga separata, scrivi esattamente:
KEYWORDS: [parola1, parola2, parola3, parola4, parola5, parola6, parola7, parola8]

Testo da rispiegare:
"""
${text.substring(0, 6000)}
"""`,
        },
      ],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract keywords
    const kwMatch = raw.match(/KEYWORDS:\s*\[?([^\]\n]+)\]?/i);
    const keywords = kwMatch
      ? kwMatch[1]
          .split(",")
          .map((k) => k.trim().replace(/[*_[\]]/g, ""))
          .filter(Boolean)
          .slice(0, 8)
      : [];

    // Clean main text
    const simplified = raw.replace(/KEYWORDS:.+/i, "").trim();

    return NextResponse.json({ simplified, keywords });
  } catch (err) {
    console.error("Simplify error:", err);
    return NextResponse.json(
      { error: "Errore nella semplificazione" },
      { status: 500 }
    );
  }
}