"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import InputSection from "@/components/InputSection";
import OutputSection from "@/components/OutputSection";
import AudioPlayer from "@/components/AudioPlayer";
import KeywordsStage from "@/components/KeywordsStage";

/* ── Loading Screen ──────────────────────────────────────── */
function LoadingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position:"fixed", inset:0,
      background:"#FAFAF7",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      zIndex:9999, gap:28,
    }}>
      {/* Ambient glow */}
      <div style={{
        position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)",
        width:400, height:400, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(126,200,227,0.15) 0%, transparent 70%)",
        pointerEvents:"none",
      }}/>

      {/* Logo */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, animation:"loaderFadeIn 0.5s ease forwards" }}>
        <div style={{
          width:76, height:76, borderRadius:28,
          background:"linear-gradient(135deg, #D6EEF5 0%, #A8D8EE 100%)",
          border:"1px solid rgba(126,200,227,0.5)",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 12px 40px rgba(126,200,227,0.35), inset 0 1px 0 rgba(255,255,255,0.8)",
          animation:"loaderPulse 2s ease-in-out infinite",
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8" fill="#7EC8E3" opacity="0.25"/>
            <circle cx="12" cy="12" r="5.5" fill="#2E8FAD"/>
            <ellipse cx="12" cy="8.5" rx="2.5" ry="3.5" fill="#1A6482" opacity="0.9"/>
            <circle cx="12" cy="12" r="1.8" fill="white" opacity="0.7"/>
          </svg>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:900, fontSize:48, letterSpacing:"-2px", color:"#2C1F0F", lineHeight:1 }}>
            coco
          </div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontStyle:"italic", fontSize:14, color:"#C4A882", marginTop:6 }}>
            studia meglio, non di più
          </div>
        </div>
      </div>

      {/* Dots */}
      <div style={{ display:"flex", gap:8, animation:"loaderFadeIn 0.5s 0.4s ease forwards", opacity:0 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width:6, height:6, borderRadius:"50%",
            background: i===0?"#7EC8E3":i===1?"#C4A882":"#2E8FAD",
            animation:`loaderDot 1.4s ${i*0.2}s ease-in-out infinite`,
          }}/>
        ))}
      </div>

      <style>{`
        @keyframes loaderFadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes loaderPulse { 0%,100%{transform:scale(1);box-shadow:0 12px 40px rgba(126,200,227,0.3)} 50%{transform:scale(1.05);box-shadow:0 16px 50px rgba(126,200,227,0.5)} }
        @keyframes loaderDot { 0%,80%,100%{transform:scale(0.7);opacity:0.3} 40%{transform:scale(1.3);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseDot { 0%,100%{opacity:0.4;transform:scale(0.85)} 50%{opacity:1;transform:scale(1)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes wave { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1.2)} }
        @keyframes gradFloat { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-52%) scale(1.05)} }
      `}</style>
    </div>
  );
}

/* ── Decorative background ───────────────────────────────── */
function Background() {
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      {/* Top-right warm blob */}
      <div style={{
        position:"absolute", top:-100, right:-100,
        width:500, height:500, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(196,168,130,0.08) 0%, transparent 70%)",
      }}/>
      {/* Bottom-left cool blob */}
      <div style={{
        position:"absolute", bottom:-80, left:-80,
        width:400, height:400, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(126,200,227,0.07) 0%, transparent 70%)",
      }}/>
      {/* Center faint grain */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E\")",
        opacity:0.5,
      }}/>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function Home() {
  const [ready, setReady]           = useState(false);
  const [simplified, setSimplified] = useState("");
  const [keywords, setKeywords]     = useState<string[]>([]);
  const [showAudio, setShowAudio]   = useState(false);
  const [activeKw, setActiveKw]     = useState(-1);
  const [isListening, setIsListening] = useState(false);

  function handleResult(text: string, kws: string[]) {
    setSimplified(text); setKeywords(kws);
    setShowAudio(false); setActiveKw(-1); setIsListening(false);
  }
  function handleListen() { setShowAudio(true); setActiveKw(0); }
  function handleReset()  {
    setSimplified(""); setKeywords([]);
    setShowAudio(false); setActiveKw(-1); setIsListening(false);
  }

  const S: Record<string, React.CSSProperties> = {
    page:    { minHeight:"100vh", background:"#FAFAF7", display:"flex", flexDirection:"column", position:"relative" },
    main:    { flex:1, maxWidth:680, margin:"0 auto", width:"100%", padding:"48px 20px 80px", display:"flex", flexDirection:"column", gap:24, position:"relative", zIndex:1 },

    /* Hero */
    hero:    { textAlign:"center", paddingBottom:4, animation:"fadeUp 0.6s ease forwards", opacity:0 },
    badge:   {
      display:"inline-flex", alignItems:"center", gap:8, marginBottom:24,
      padding:"7px 18px", borderRadius:999,
      background:"rgba(214,238,245,0.5)",
      border:"1px solid rgba(126,200,227,0.35)",
      backdropFilter:"blur(8px)",
      animation:"gradFloat 4s ease-in-out infinite",
    },
    badgeDot: { width:6, height:6, borderRadius:"50%", background:"#2E8FAD", animation:"pulseDot 1.4s ease-in-out infinite" },
    badgeTxt: { fontSize:12, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600, color:"#1A6482", letterSpacing:"0.4px" },

    h1:      {
      fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:900,
      fontSize:"clamp(30px,5.5vw,50px)", letterSpacing:"-1.5px",
      color:"#2C1F0F", lineHeight:1.1, marginBottom:14,
    },
    h1line2: {
      background:"linear-gradient(135deg, #2E8FAD 0%, #1A6482 50%, #7EC8E3 100%)",
      WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
      backgroundClip:"text",
    },
    sub: {
      fontSize:15, fontFamily:"'DM Sans',sans-serif", fontStyle:"italic",
      color:"#9B7B5A", lineHeight:1.65, margin:"0 auto", maxWidth:460,
    },

    /* Steps */
    steps:   { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, animation:"fadeUp 0.6s 0.15s ease forwards", opacity:0 },
    step:    {
      background:"rgba(255,255,255,0.8)", backdropFilter:"blur(12px)",
      border:"1px solid rgba(232,221,208,0.8)", borderRadius:22,
      padding:"18px 14px", textAlign:"center",
      boxShadow:"0 2px 12px rgba(44,31,15,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
      transition:"box-shadow 0.2s, transform 0.2s",
    },
    stepNum: { fontSize:10, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, color:"#7EC8E3", marginBottom:8, letterSpacing:"2px", textTransform:"uppercase" as const },
    stepLbl: { fontSize:14, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, color:"#2C1F0F", marginBottom:4 },
    stepDsc: { fontSize:12, fontFamily:"'DM Sans',sans-serif", color:"#9B7B5A", lineHeight:1.45 },

    /* Footer */
    footer:  { borderTop:"1px solid rgba(232,221,208,0.5)", padding:"20px 24px", position:"relative", zIndex:1 },
    footIn:  { maxWidth:680, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center" },
    footTxt: { fontSize:12, fontFamily:"'DM Sans',sans-serif", color:"#C4A882" },
    note:    { textAlign:"center" as const, fontSize:12, fontFamily:"'DM Sans',sans-serif", color:"#C4A882", paddingTop:4, lineHeight:1.6 },
  };

  return (
    <>
      {/* Loading screen */}
      {!ready && <LoadingScreen onDone={() => setReady(true)} />}

      <div style={{ ...S.page, opacity: ready ? 1 : 0, transition:"opacity 0.5s ease" }}>
        <Background />
        <Header />

        <main style={S.main}>
          {/* Hero */}
          <div style={S.hero}>
            <div style={S.badge}>
              <span style={S.badgeDot}/>
              <span style={S.badgeTxt}>DSA friendly · Voce AI · Parole chiave animate</span>
            </div>
            <h1 style={S.h1}>
              I tuoi appunti,<br/>
              <span style={S.h1line2}>trasformati in lezione</span>
            </h1>
            <p style={S.sub}>
              Incolla sbobine, capitoli o slide.<br/>
              COCO li rispega come un professore e li legge ad alta voce.
            </p>
          </div>

          {/* Steps */}
          {!simplified && (
            <div style={S.steps}>
              {[
                { num:"01", label:"Incolla", desc:"Sbobine, appunti, capitoli — qualsiasi testo" },
                { num:"02", label:"Rispega", desc:"L'AI lo riscrive come una lezione coinvolgente" },
                { num:"03", label:"Ascolta", desc:"Voce AI naturale con parole chiave animate" },
              ].map((s,i) => (
                <div key={s.num} style={S.step}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(44,31,15,0.1), inset 0 1px 0 rgba(255,255,255,0.9)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(44,31,15,0.06), inset 0 1px 0 rgba(255,255,255,0.9)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <div style={S.stepNum}>{s.num}</div>
                  <div style={S.stepLbl}>{s.label}</div>
                  <div style={S.stepDsc}>{s.desc}</div>
                </div>
              ))}
            </div>
          )}

          <InputSection onResult={handleResult} />

          {simplified && (
            <OutputSection text={simplified} onListen={handleListen} onReset={handleReset} isListening={isListening} />
          )}

          {showAudio && keywords.length > 0 && (
            <KeywordsStage keywords={keywords} activeIndex={activeKw} />
          )}

          {showAudio && (
            <AudioPlayer
              text={simplified}
              onActiveKeyword={setActiveKw}
              keywordsCount={keywords.length}
              onPlayStateChange={setIsListening}
            />
          )}

          <p style={S.note}>
            COCO usa l&apos;IA per spiegare, non per inventare.<br/>
            Rileggi sempre i tuoi appunti originali per verificare.
          </p>
        </main>

        <footer style={S.footer}>
          <div style={S.footIn}>
            <span style={S.footTxt}>© 2026 COCO</span>
            <span style={S.footTxt}>Fatto con cura per chi studia 🥥</span>
          </div>
        </footer>
      </div>
    </>
  );
}