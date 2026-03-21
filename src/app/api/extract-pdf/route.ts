import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) return NextResponse.json({ error: "Nessun file ricevuto" }, { status: 400 });
    if (file.type !== "application/pdf") return NextResponse.json({ error: "Il file deve essere un PDF" }, { status: 400 });
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "File troppo grande (max 20MB)" }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text: rawText, totalPages } = await extractText(pdf, { mergePages: true });

    const text = rawText
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();

    if (!text || text.length < 20) {
      return NextResponse.json({
        error: "Non riesco a estrarre testo. Il PDF potrebbe essere una scansione senza OCR.",
      }, { status: 422 });
    }

    return NextResponse.json({ text, pages: totalPages, chars: text.length });
  } catch (err: any) {
    console.error("PDF parse error:", err);
    return NextResponse.json({ error: "Errore durante la lettura del PDF" }, { status: 500 });
  }
}