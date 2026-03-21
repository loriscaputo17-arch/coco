"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Square, RotateCcw, Check, Loader2 } from "lucide-react";

// 30-second text covering all Italian phonemes
const SAMPLE_TEXT = `Benvenuto in COCO. Ti chiedo di leggere questo testo ad alta voce, con calma e chiarezza, come se stessi spiegando qualcosa a un amico. La fotosintesi clorofilliana è il processo attraverso cui le piante trasformano la luce solare in energia chimica. Grazie a questo meccanismo straordinario, ogni foglia diventa una piccola centrale energetica. Le molecole di acqua vengono scisse, l'anidride carbonica viene assorbita, e il risultato finale è glucosio e ossigeno puro. Senza questo processo, la vita sulla Terra come la conosciamo non esisterebbe. Bene, hai finito. Grazie per aver registrato la tua voce.`;

type Step = "intro" | "recording" | "preview" | "cloning" | "done";

interface VoiceClonerProps {
  onVoiceReady: (voiceId: string) => void;
  onClose: () => void;
}

export default function VoiceCloner({ onVoiceReady, onClose }: VoiceClonerProps) {
  const [step, setStep] = useState<Step>("intro");
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [cloning, setCloning] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setStep("preview");
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(100);
      setStep("recording");
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= 59) {
            stopRecording();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Microfono non accessibile. Controlla i permessi del browser.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setSeconds(0);
    setStep("intro");
  };

  const handleClone = async () => {
    if (!audioBlob) return;
    setCloning(true);
    setStep("cloning");
    setError("");

    try {
      const form = new FormData();
      form.append("audio", audioBlob, "recording.webm");
      form.append("name", "COCO Voice " + Date.now());

      const res = await fetch("/api/clone-voice", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Errore cloning");

      // Save voice_id to localStorage for future sessions
      localStorage.setItem("coco_voice_id", data.voice_id);
      setStep("done");
      setTimeout(() => onVoiceReady(data.voice_id), 1500);
    } catch (e: any) {
      setError(e.message);
      setStep("preview");
    } finally {
      setCloning(false);
    }
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(44,31,15,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-coco-lg w-full max-w-lg overflow-hidden animate-fade-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-coco-coconut/60">
          <div>
            <h2 className="font-display font-800 text-lg text-coco-mocha">Clona la tua voce</h2>
            <p className="text-xs font-body text-coco-bark mt-0.5">Powered by ElevenLabs</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-coco-bark hover:text-coco-mocha rounded-xl hover:bg-coco-cream transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* INTRO */}
          {step === "intro" && (
            <>
              <div className="bg-coco-sky/30 border border-coco-blue/20 rounded-2xl p-4">
                <p className="text-xs font-display font-700 uppercase tracking-wider text-coco-blue-dark mb-2">
                  Testo da leggere ad alta voce
                </p>
                <p className="text-sm font-body text-coco-mocha leading-relaxed">
                  {SAMPLE_TEXT}
                </p>
              </div>
              <div className="flex items-start gap-3 text-xs font-body text-coco-bark">
                <span className="mt-0.5">💡</span>
                <span>Leggi il testo sopra in modo naturale e calmo. Bastano 30-60 secondi per clonare la tua voce.</span>
              </div>
              <button
                onClick={startRecording}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-coco-blue-deep text-white font-display font-700 text-base hover:bg-coco-blue-dark transition-colors active:scale-[0.98] cursor-pointer"
              >
                <Mic size={18} />
                Inizia a registrare
              </button>
            </>
          )}

          {/* RECORDING */}
          {step === "recording" && (
            <>
              <div className="bg-coco-sky/30 border border-coco-blue/20 rounded-2xl p-4 max-h-48 overflow-y-auto">
                <p className="text-sm font-body text-coco-mocha leading-relaxed">
                  {SAMPLE_TEXT}
                </p>
              </div>

              {/* Recording indicator */}
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="flex gap-1 items-end h-10">
                  {[0,1,2,3,4].map((n) => (
                    <div key={n} className="wave-bar" style={{ animationDelay: `${n * 0.1}s` }} />
                  ))}
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-display font-700 text-coco-mocha text-lg tabular-nums">
                      {fmtTime(seconds)}
                    </span>
                  </div>
                  <p className="text-xs text-coco-bark mt-0.5">in registrazione</p>
                </div>
              </div>

              <button
                onClick={stopRecording}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500 text-white font-display font-700 text-base hover:bg-red-600 transition-colors active:scale-[0.98] cursor-pointer"
              >
                <Square size={16} fill="white" />
                Ferma registrazione
              </button>
            </>
          )}

          {/* PREVIEW */}
          {step === "preview" && audioUrl && (
            <>
              <div className="bg-coco-cream/60 rounded-2xl p-4 text-center">
                <p className="text-sm font-body text-coco-bark mb-3">
                  Registrazione di <span className="font-700 text-coco-mocha">{fmtTime(seconds)}</span> secondi
                </p>
                <audio src={audioUrl} controls className="w-full rounded-xl" />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetRecording}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-coco-coconut font-display font-700 text-sm text-coco-bark hover:border-coco-brown hover:text-coco-brown transition-colors cursor-pointer"
                >
                  <RotateCcw size={15} />
                  Riregistra
                </button>
                <button
                  onClick={handleClone}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-coco-blue-deep text-white font-display font-700 text-sm hover:bg-coco-blue-dark transition-colors active:scale-[0.98] cursor-pointer"
                >
                  <Mic size={15} />
                  Clona voce
                </button>
              </div>
            </>
          )}

          {/* CLONING */}
          {step === "cloning" && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-coco-sky/40 flex items-center justify-center mx-auto">
                <Loader2 size={28} className="text-coco-blue-deep animate-spin" />
              </div>
              <div>
                <p className="font-display font-700 text-coco-mocha">Clonando la tua voce...</p>
                <p className="text-sm font-body text-coco-bark mt-1">Ci vogliono circa 10-20 secondi</p>
              </div>
            </div>
          )}

          {/* DONE */}
          {step === "done" && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-coco-green-light flex items-center justify-center mx-auto" style={{ background: "#D1FAE5" }}>
                <Check size={28} className="text-green-600" />
              </div>
              <div>
                <p className="font-display font-700 text-coco-mocha">Voce clonata con successo!</p>
                <p className="text-sm font-body text-coco-bark mt-1">COCO userà la tua voce per le lezioni</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-body rounded-2xl">
              ⚠ {error}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}