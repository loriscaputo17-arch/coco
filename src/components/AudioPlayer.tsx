"use client";

import { useEffect, useRef, useState } from "react";
import VoicePicker from "./VoicePicker";

interface AudioPlayerProps {
  text: string;
  onActiveKeyword: (index: number) => void;
  keywordsCount: number;
  onPlayStateChange: (playing: boolean) => void;
}

export default function AudioPlayer({
  text,
  onActiveKeyword,
  keywordsCount,
  onPlayStateChange,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying]       = useState(false);
  const [progress, setProgress]         = useState(0);
  const [duration, setDuration]         = useState(0);
  const [currentTime, setCurTime]       = useState(0);
  const [voiceMode, setVoiceMode]       = useState<"browser"|"elevenlabs">("elevenlabs");
  const [selectedVoice, setSelectedVoice] = useState("luca");
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [hasElevenKey, setHasElevenKey] = useState(false);

  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const kwTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const kwIndexRef  = useRef(0);
  const startedRef  = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("coco_voice");
    if (saved) setSelectedVoice(saved);
    fetch("/api/speak", { method: "HEAD" })
      .then(r => { if (r.status !== 503) setHasElevenKey(true); else setVoiceMode("browser"); })
      .catch(() => setVoiceMode("browser"));
  }, []);

  useEffect(() => {
    return () => { speechSynthesis.cancel(); clearKwTimer(); };
  }, []);

  function clearKwTimer() {
    if (kwTimerRef.current) clearInterval(kwTimerRef.current);
  }

  function startKwCycle(durationSec: number) {
    clearKwTimer();
    kwIndexRef.current = 0;
    onActiveKeyword(0);
    if (keywordsCount <= 0 || durationSec <= 0) return;
    const interval = (durationSec * 1000) / keywordsCount;
    kwTimerRef.current = setInterval(() => {
      kwIndexRef.current++;
      if (kwIndexRef.current >= keywordsCount) { clearKwTimer(); onActiveKeyword(keywordsCount); return; }
      onActiveKeyword(kwIndexRef.current);
    }, interval);
  }

  function playBrowser() {
    if (!("speechSynthesis" in window)) { setError("Browser non supporta la sintesi vocale"); return; }
    const clean = text.replace(/\*\*/g,"").replace(/\*/g,"").replace(/#/g,"");
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "it-IT"; utt.rate = 0.88; utt.pitch = 1.0;
    const voices = speechSynthesis.getVoices();
    const itVoice = voices.find(v => v.lang.startsWith("it"));
    if (itVoice) utt.voice = itVoice;
    const estDuration = (clean.split(/\s+/).length / 130) * 60 * (1 / 0.88);
    utt.onstart  = () => { setIsPlaying(true); onPlayStateChange(true); startKwCycle(estDuration); setDuration(estDuration); };
    utt.onend    = () => { setIsPlaying(false); onPlayStateChange(false); setProgress(100); clearKwTimer(); };
    utt.onerror  = () => { setIsPlaying(false); onPlayStateChange(false); };
    utt.onboundary = (e) => {
      if (clean.length > 0) { setProgress((e.charIndex/clean.length)*100); setCurTime((e.charIndex/clean.length)*estDuration); }
    };
    speechSynthesis.speak(utt);
  }

  async function playElevenLabs() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice_name: selectedVoice }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Errore audio"); }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      if (audioRef.current) { audioRef.current.pause(); URL.revokeObjectURL(audioRef.current.src); }
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onloadedmetadata = () => setDuration(audio.duration);

      audio.ontimeupdate = () => {
        const p = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        setProgress(p);
        setCurTime(audio.currentTime);

        // Sync keywords to real playback position
        if (keywordsCount > 0 && audio.duration > 0) {
          const kwIdx = Math.floor((audio.currentTime / audio.duration) * keywordsCount);
          const clamped = Math.min(kwIdx, keywordsCount - 1);
          if (clamped !== kwIndexRef.current) {
            kwIndexRef.current = clamped;
            onActiveKeyword(clamped);
          }
        }
      };

      audio.onplay = () => { setIsPlaying(true); onPlayStateChange(true); };
      audio.onended = () => {
        setIsPlaying(false); onPlayStateChange(false);
        setProgress(100); clearKwTimer();
        onActiveKeyword(keywordsCount); // mark all done
      };
      await audio.play();
    } catch(e:any) {
      setError(e.message||"Errore audio");
      setVoiceMode("browser"); playBrowser();
    } finally { setLoading(false); }
  }

  async function handlePlay() {
    if (isPlaying) {
      if (voiceMode === "browser") speechSynthesis.pause(); else audioRef.current?.pause();
      setIsPlaying(false); onPlayStateChange(false); clearKwTimer();
    } else if (!startedRef.current || progress >= 99) {
      startedRef.current = true; setProgress(0); kwIndexRef.current = 0; onActiveKeyword(0);
      if (voiceMode === "elevenlabs" && hasElevenKey) await playElevenLabs();
      else { speechSynthesis.cancel(); playBrowser(); }
    } else {
      if (voiceMode === "browser") speechSynthesis.resume(); else audioRef.current?.play();
      setIsPlaying(true); onPlayStateChange(true);
    }
  }

  function handleRestart() {
    speechSynthesis.cancel();
    if (audioRef.current) audioRef.current.pause();
    clearKwTimer(); setIsPlaying(false); onPlayStateChange(false);
    setProgress(0); setCurTime(0); startedRef.current = false; onActiveKeyword(-1);
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || voiceMode === "browser") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
    setProgress(pct * 100);
  }

  function handleVoiceChange(key: string) {
    setSelectedVoice(key); localStorage.setItem("coco_voice", key);
    handleRestart(); setShowVoicePicker(false);
  }

  function fmt(sec: number) {
    const m = Math.floor(sec/60), s = Math.floor(sec%60);
    return `${m}:${s.toString().padStart(2,"0")}`;
  }

  const voiceLabels: Record<string,string> = {
    luca:"Luca — Professore", giovanni:"Giovanni — Autorevole",
    george:"George — Accademico", aria:"Aria — Coinvolgente",
  };

  return (
    <section style={{ animation:"fadeUp 0.5s ease forwards", opacity:0 }}>
      <div style={{
        background:"#2C1F0F", borderRadius:26,
        boxShadow:"0 8px 40px rgba(44,31,15,0.2)", overflow:"hidden",
      }}>

        {/* Mode tabs */}
        {hasElevenKey && (
          <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
            {[{key:"elevenlabs",label:"✨ Voce AI"},{key:"browser",label:"🗣 Browser"}].map(m => (
              <button key={m.key}
                onClick={()=>{handleRestart();setVoiceMode(m.key as any);}}
                style={{
                  flex:1, padding:"12px 0", border:"none", cursor:"pointer",
                  fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:11, fontWeight:700,
                  letterSpacing:"1px", textTransform:"uppercase" as const,
                  background: voiceMode===m.key ? "rgba(255,255,255,0.08)" : "transparent",
                  color: voiceMode===m.key ? "#fff" : "rgba(255,255,255,0.35)",
                  transition:"all 0.15s",
                }}
              >{m.label}</button>
            ))}
          </div>
        )}

        <div style={{ padding:"24px" }}>
          {/* Top row */}
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>

            {/* Play button */}
            <button
              onClick={handlePlay}
              disabled={loading}
              style={{
                width:56, height:56, borderRadius:18, border:"none", flexShrink:0,
                background: loading ? "rgba(255,255,255,0.15)" : "linear-gradient(135deg,#7EC8E3,#2E8FAD)",
                cursor: loading ? "wait" : "pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow: loading ? "none" : "0 4px 16px rgba(126,200,227,0.4)",
                transition:"all 0.15s", outline:"none",
              }}
              onMouseEnter={e=>{if(!loading)(e.currentTarget).style.transform="scale(1.05)";}}
              onMouseLeave={e=>{(e.currentTarget).style.transform="scale(1)";}}
              onMouseDown={e=>{(e.currentTarget).style.transform="scale(0.93)";}}
              onMouseUp={e=>{(e.currentTarget).style.transform="scale(1)";}}
            >
              {loading ? (
                <div style={{ width:20,height:20,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.7s linear infinite" }}/>
              ) : isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{marginLeft:2}}><polygon points="5,3 19,12 5,21"/></svg>
              )}
            </button>

            {/* Info */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7EC8E3" strokeWidth="2.5" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:14, color:"#fff" }}>
                  Lezione COCO
                </span>
              </div>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(255,255,255,0.35)" }}>
                {loading ? "Generando audio..." : isPlaying ? "In riproduzione..." : progress>0&&progress<99 ? "In pausa" : progress>=99 ? "Completato ✓" : "Premi play per ascoltare"}
              </span>
            </div>

            {/* Restart */}
            <button onClick={handleRestart} style={{ width:32,height:32,borderRadius:10,border:"none",background:"rgba(255,255,255,0.06)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.35)",transition:"all 0.15s",outline:"none" }}
              onMouseEnter={e=>{(e.currentTarget).style.background="rgba(255,255,255,0.12)";(e.currentTarget).style.color="rgba(255,255,255,0.8)";}}
              onMouseLeave={e=>{(e.currentTarget).style.background="rgba(255,255,255,0.06)";(e.currentTarget).style.color="rgba(255,255,255,0.35)";}}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
            </button>
          </div>

          {/* Wave bars when playing */}
          {isPlaying && (
            <div style={{ display:"flex", gap:3, alignItems:"flex-end", justifyContent:"center", height:32, marginBottom:16 }}>
              {[10,18,14,22,16,20,12,18,14].map((h,n) => (
                <div key={n} style={{ width:3, height:h, borderRadius:3, background:"#7EC8E3", transformOrigin:"bottom", animation:"wave 1s ease-in-out infinite", animationDelay:`${n*0.08}s` }}/>
              ))}
            </div>
          )}

          {/* Progress bar */}
          <div
            onClick={handleSeek}
            style={{ height:4, borderRadius:99, background:"rgba(255,255,255,0.1)", cursor:"pointer", overflow:"hidden", marginBottom:8 }}
          >
            <div style={{ height:"100%", borderRadius:99, background:"linear-gradient(90deg,#7EC8E3,#2E8FAD)", width:`${progress}%`, transition:"width 0.3s linear" }}/>
          </div>

          {/* Time */}
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
            <span style={{ fontSize:11, fontFamily:"'DM Sans',sans-serif", color:"rgba(255,255,255,0.25)" }}>{fmt(currentTime)}</span>
            <span style={{ fontSize:11, fontFamily:"'DM Sans',sans-serif", color:"rgba(255,255,255,0.25)" }}>{duration>0?fmt(duration):"--:--"}</span>
          </div>

          {/* Voice picker — only ElevenLabs */}
          {voiceMode==="elevenlabs" && hasElevenKey && (
            <div>
              <button
                onClick={()=>setShowVoicePicker(v=>!v)}
                style={{
                  width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"12px 16px", borderRadius:16,
                  border:"1px solid rgba(255,255,255,0.1)",
                  background:"rgba(255,255,255,0.05)",
                  cursor:"pointer", transition:"background 0.15s", outline:"none",
                }}
                onMouseEnter={e=>{(e.currentTarget).style.background="rgba(255,255,255,0.09)";}}
                onMouseLeave={e=>{(e.currentTarget).style.background="rgba(255,255,255,0.05)";}}
              >
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, fontFamily:"'DM Sans',sans-serif", color:"rgba(255,255,255,0.35)" }}>Voce:</span>
                  <span style={{ fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600, color:"#fff" }}>
                    {voiceLabels[selectedVoice]||selectedVoice}
                  </span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round">
                  {showVoicePicker
                    ? <polyline points="18 15 12 9 6 15"/>
                    : <polyline points="6 9 12 15 18 9"/>
                  }
                </svg>
              </button>

              {showVoicePicker && (
                <div style={{ marginTop:10 }}>
                  <VoicePicker selected={selectedVoice} onChange={handleVoiceChange}/>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding:"0 24px 16px", fontSize:12, fontFamily:"'DM Sans',sans-serif", color:"rgba(252,165,165,0.9)" }}>
            ⚠ {error} — uso voce browser
          </div>
        )}
      </div>
    </section>
  );
}