import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ELEVENLABS_API_KEY non configurata" }, { status: 503 });
    }

    const formData = await req.formData();
    const audioBlob = formData.get("audio") as Blob;
    const voiceName = (formData.get("name") as string) || "COCO My Voice";

    if (!audioBlob) {
      return NextResponse.json({ error: "Audio mancante" }, { status: 400 });
    }

    // Send to ElevenLabs voice cloning API
    const elevenForm = new FormData();
    elevenForm.append("name", voiceName);
    elevenForm.append("description", "Voce clonata da COCO Study App");
    elevenForm.append("files", audioBlob, "recording.webm");
    elevenForm.append("labels", JSON.stringify({ app: "coco", lang: "it" }));

    const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
      },
      body: elevenForm,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("ElevenLabs clone error:", err);
      return NextResponse.json({ error: "Errore nel cloning della voce" }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json({ voice_id: data.voice_id });
  } catch (err: any) {
    console.error("Clone voice error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}