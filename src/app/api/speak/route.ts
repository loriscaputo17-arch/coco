import { NextRequest, NextResponse } from "next/server";

const VOICES = {
  luca:    "TxGEqnHWrfWFTfGW9XjX",
  aria:    "9BWtsMINqrJLrRacOk9x",
  george:  "JBFqnCBsd6RMkjVDRZzb",
  giovanni:"zcAOhNBS3c14rBihAFp1",
} as const;

function cleanForTTS(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*/g, "")
    .replace(/#+\s/g, "")
    .replace(/\s—\s/g, ", ")
    .replace(/\s-\s/g, ", ")
    .replace(/\.\.\./g, "…")
    .replace(/^\d+\.\s/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
    .substring(0, 5000);
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice_name, voice_id } = await req.json();

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ELEVENLABS_API_KEY non configurata" }, { status: 503 });
    }

    const selectedVoiceId =
      voice_id ||
      VOICES[voice_name as keyof typeof VOICES] ||
      VOICES.luca;

    const clean = cleanForTTS(text);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: clean,
          model_id: "eleven_multilingual_v2",
          language_code: "it",
          voice_settings: {
            stability: 0.28,
            similarity_boost: 0.72,
            style: 0.62,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("ElevenLabs error:", err);
      return NextResponse.json({ error: "Errore generazione audio" }, { status: 502 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("Speak error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function HEAD() {
  const hasKey = !!process.env.ELEVENLABS_API_KEY;
  return new NextResponse(null, { status: hasKey ? 200 : 503 });
}