"use client";
import { useState } from "react";

interface Props { text: string; onListen:()=>void; onReset:()=>void; isListening:boolean; }

export default function OutputSection({ text, onListen, onReset, isListening }: Props) {
  const [copied, setCopied] = useState(false);
  const [hoverListen, setHoverListen] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2200); });
  }

  function renderText(raw: string) {
    return raw.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} style={{ height:10 }}/>;
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return (
        <p key={i} style={{ margin:"0 0 8px", lineHeight:1.8, fontFamily:"'DM Sans',sans-serif", fontSize:15, color:"#2C1F0F" }}>
          {parts.map((part,j) => j%2===1
            ? <strong key={j} style={{ fontWeight:600, color:"#1A6482", background:"rgba(214,238,245,0.35)", padding:"1px 4px", borderRadius:5 }}>{part}</strong>
            : <span key={j}>{part}</span>
          )}
        </p>
      );
    });
  }

  const S: Record<string,React.CSSProperties> = {
    wrap:   { animation:"fadeUp 0.5s ease forwards", opacity:0 },
    card:   {
      background:"rgba(255,255,255,0.92)", backdropFilter:"blur(16px)",
      WebkitBackdropFilter:"blur(16px)",
      border:"1.5px solid rgba(214,238,245,0.6)", borderRadius:26,
      boxShadow:"0 4px 24px rgba(44,31,15,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
      overflow:"hidden",
    },
    topBar: {
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"14px 22px", borderBottom:"1px solid rgba(214,238,245,0.5)",
      background:"rgba(214,238,245,0.15)",
    },
    dotRow: { display:"flex", alignItems:"center", gap:8 },
    dot:    { width:7, height:7, borderRadius:"50%", background:"#7EC8E3", animation:"pulseDot 1.4s ease-in-out infinite" },
    label:  { fontSize:11, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"1.2px", color:"#2E8FAD" },
    actions:{ display:"flex", gap:6 },
    actBtn: {
      display:"flex", alignItems:"center", gap:5, padding:"5px 13px",
      borderRadius:10, border:"1px solid rgba(232,221,208,0.8)",
      background:"rgba(255,255,255,0.7)", backdropFilter:"blur(8px)",
      fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500,
      color:"#9B7B5A", cursor:"pointer", transition:"all 0.15s",
      outline:"none",
    },
    body:   { padding:"22px 22px 18px" },
    botBar: { padding:"16px 22px 18px", borderTop:"1px solid rgba(232,221,208,0.5)", background:"rgba(245,240,232,0.15)" },
    listenBtn: {
      width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
      padding:"16px 24px", borderRadius:20, border:"none", cursor:"pointer",
      fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:16, fontWeight:700,
      outline:"none", transition:"all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
    },
    listenOn:  {
      background:"rgba(214,238,245,0.5)", color:"#2E8FAD",
      border:"1.5px solid rgba(126,200,227,0.4)",
    },
    listenOff: {
      background: hoverListen
        ? "linear-gradient(135deg, #1A6482 0%, #3BA0C4 100%)"
        : "linear-gradient(135deg, #1A6482 0%, #2E8FAD 100%)",
      color:"#fff",
      boxShadow: hoverListen
        ? "0 8px 28px rgba(26,100,130,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"
        : "0 4px 18px rgba(26,100,130,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
      transform: hoverListen ? "translateY(-1px)" : "translateY(0)",
    },
  };

  const waveBars = [10,16,12,18,14,18,12].map((h,i) => (
    <div key={i} style={{
      width:3, height:h, borderRadius:3, background:"#2E8FAD",
      transformOrigin:"bottom", animation:"wave 1s ease-in-out infinite",
      animationDelay:`${i*0.1}s`, flexShrink:0,
    }}/>
  ));

  return (
    <section style={S.wrap}>
      <div style={S.card}>
        <div style={S.topBar}>
          <div style={S.dotRow}>
            <div style={S.dot}/>
            <span style={S.label}>Lezione semplificata</span>
          </div>
          <div style={S.actions}>
            <button
              onClick={handleCopy} style={S.actBtn}
              onMouseEnter={e=>{(e.currentTarget).style.background="rgba(214,238,245,0.4)";(e.currentTarget).style.borderColor="rgba(126,200,227,0.4)";(e.currentTarget).style.color="#2E8FAD";}}
              onMouseLeave={e=>{(e.currentTarget).style.background="rgba(255,255,255,0.7)";(e.currentTarget).style.borderColor="rgba(232,221,208,0.8)";(e.currentTarget).style.color="#9B7B5A";}}
            >
              {copied ? "✓ Copiato" : "📋 Copia"}
            </button>
            <button
              onClick={onReset} style={S.actBtn}
              onMouseEnter={e=>{(e.currentTarget).style.background="rgba(245,240,232,0.8)";(e.currentTarget).style.color="#7A5C3A";}}
              onMouseLeave={e=>{(e.currentTarget).style.background="rgba(255,255,255,0.7)";(e.currentTarget).style.color="#9B7B5A";}}
            >
              ↺ Nuovo
            </button>
          </div>
        </div>

        <div style={S.body}>{renderText(text)}</div>

        <div style={S.botBar}>
          <button
            onClick={onListen}
            disabled={isListening}
            style={{ ...S.listenBtn, ...(isListening ? S.listenOn : S.listenOff) }}
            onMouseEnter={()=>setHoverListen(true)}
            onMouseLeave={()=>setHoverListen(false)}
            onMouseDown={e=>{(e.currentTarget).style.transform="scale(0.98)";}}
            onMouseUp={e=>{(e.currentTarget).style.transform=isListening?"":"translateY(-1px)";}}
          >
            {isListening ? (
              <><div style={{ display:"flex", gap:3, alignItems:"flex-end", height:20 }}>{waveBars}</div><span>In ascolto...</span></>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
                <span>Ascolta la lezione</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}