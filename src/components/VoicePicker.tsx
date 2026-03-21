"use client";
import { useState } from "react";

interface Voice { key:string; name:string; description:string; gender:"M"|"F"; style:string; emoji:string; }

const VOICES: Voice[] = [
  { key:"luca",     name:"Luca",     description:"Caldo e professionale, ideale per lezioni universitarie", gender:"M", style:"Professore", emoji:"🎓" },
  { key:"giovanni", name:"Giovanni", description:"Profondo e autorevole, voce italiana nativa",              gender:"M", style:"Autorevole", emoji:"📚" },
  { key:"george",   name:"George",   description:"Tono accademico chiaro, ottimo per contenuti tecnici",     gender:"M", style:"Accademico", emoji:"🔬" },
  { key:"aria",     name:"Aria",     description:"Naturale e coinvolgente, perfetta per narrazioni",          gender:"F", style:"Coinvolgente",emoji:"✨" },
];

interface Props { selected:string; onChange:(key:string)=>void; }

export default function VoicePicker({ selected, onChange }: Props) {
  const [hovered, setHovered] = useState<string|null>(null);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:4 }}>
      {VOICES.map((v) => {
        const isSelected = selected === v.key;
        const isHovered  = hovered  === v.key;
        return (
          <button
            key={v.key}
            onClick={() => onChange(v.key)}
            onMouseEnter={() => setHovered(v.key)}
            onMouseLeave={() => setHovered(null)}
            style={{
              textAlign:"left", padding:"12px 14px", borderRadius:16,
              border: isSelected ? "1.5px solid rgba(126,200,227,0.7)" : "1.5px solid rgba(255,255,255,0.15)",
              background: isSelected
                ? "rgba(214,238,245,0.2)"
                : isHovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
              cursor:"pointer", transition:"all 0.18s ease",
              boxShadow: isSelected ? "0 0 0 3px rgba(126,200,227,0.15)" : "none",
              outline:"none",
            }}
          >
            {/* Top row */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:18 }}>{v.emoji}</span>
              <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:14, color: isSelected ? "#7EC8E3" : "rgba(255,255,255,0.9)" }}>
                {v.name}
              </span>
              {isSelected && (
                <span style={{ marginLeft:"auto", color:"#7EC8E3" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
              )}
            </div>
            {/* Style badge */}
            <div style={{ marginBottom:5 }}>
              <span style={{
                fontSize:10, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700,
                padding:"2px 8px", borderRadius:8,
                background: isSelected ? "rgba(126,200,227,0.2)" : "rgba(255,255,255,0.08)",
                color: isSelected ? "#7EC8E3" : "rgba(255,255,255,0.4)",
                textTransform:"uppercase" as const, letterSpacing:"0.8px",
              }}>
                {v.style}
              </span>
            </div>
            {/* Description */}
            <p style={{ fontSize:11, fontFamily:"'DM Sans',sans-serif", color:"rgba(255,255,255,0.35)", lineHeight:1.4, margin:0 }}>
              {v.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}