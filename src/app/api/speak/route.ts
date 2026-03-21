import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const VOICES = {
  luca:    "TxGEqnHWrfWFTfGW9XjX",
  aria:    "9BWtsMINqrJLrRacOk9x",
  george:  "JBFqnCBsd6RMkjVDRZzb",
  giovanni:"zcAOhNBS3c14rBihAFp1",
} as const;

// Cache dir inside .next (persists during dev server session)
const CACHE_DIR = join(process.cwd(), ".next", "audio-cache");

function ensureCache() {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
}

function getCacheKey(text: string, voiceId: string): string {
  return createHash("md5").update(text + voiceId).digest("hex");
}

function getCachePath(key: string): string {
  return join(CACHE_DIR, `${key}.mp3`);
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

    // Clean text
    const clean = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#+ /g, "")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^\d+\.\s/gm, "")
      .substring(0, 5000);

    // ── Check cache ──────────────────────────────────────────
    ensureCache();
    const cacheKey = getCacheKey(clean, selectedVoiceId);
    const cachePath = getCachePath(cacheKey);

    if (existsSync(cachePath)) {
      console.log(`[audio-cache] HIT ${cacheKey.slice(0, 8)}`);
      const cached = readFileSync(cachePath);
      return new NextResponse(cached, {
        headers: {
          "Content-Type": "audio/mpeg",
          "X-Cache": "HIT",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // ── Generate via ElevenLabs ──────────────────────────────
    console.log(`[audio-cache] MISS ${cacheKey.slice(0, 8)} — calling ElevenLabs`);

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
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.75,
            style: 0.45,
            use_speaker_boost: true,
          },
          language_code: "it",
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("ElevenLabs error:", err);
      return NextResponse.json({ error: "Errore generazione audio" }, { status: 502 });
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBytes = Buffer.from(audioBuffer);

    // ── Save to cache ────────────────────────────────────────
    try {
      writeFileSync(cachePath, audioBytes);
      console.log(`[audio-cache] SAVED ${cacheKey.slice(0, 8)} (${(audioBytes.length / 1024).toFixed(0)}KB)`);
    } catch (e) {
      console.warn("[audio-cache] Could not write cache:", e);
    }

    return new NextResponse(audioBytes, {
      headers: {
        "Content-Type": "audio/mpeg",
        "X-Cache": "MISS",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: any) {
    console.error("Speak error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// HEAD request to check if ElevenLabs is configured
export async function HEAD() {
  const hasKey = !!process.env.ELEVENLABS_API_KEY;
  return new NextResponse(null, { status: hasKey ? 200 : 503 });
}