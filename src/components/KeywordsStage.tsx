"use client";
import { useEffect, useRef } from "react";

interface Props { keywords: string[]; activeIndex: number; }

const COLORS = [
  { bg:"rgba(214,238,245,0.7)", text:"#1A6482", border:"rgba(126,200,227,0.5)" },
  { bg:"rgba(232,221,208,0.7)", text:"#4A3420", border:"rgba(196,168,130,0.5)" },
  { bg:"rgba(235,245,240,0.7)", text:"#1E5C3A", border:"rgba(126,200,168,0.5)" },
  { bg:"rgba(245,239,232,0.7)", text:"#7A5020", border:"rgba(196,168,130,0.5)" },
  { bg:"rgba(237,232,245,0.7)", text:"#4A2A80", border:"rgba(184,160,216,0.5)" },
  { bg:"rgba(245,240,232,0.7)", text:"#7A5C3A", border:"rgba(196,168,130,0.5)" },
  { bg:"rgba(224,239,245,0.7)", text:"#1A6482", border:"rgba(126,200,227,0.5)" },
  { bg:"rgba(245,245,235,0.7)", text:"#5A6020", border:"rgba(180,190,100,0.5)" },
];
const SIZES  = [30, 22, 36, 20, 28, 24, 32, 22];
const ROTATIONS = [-1, 1, -0.5, 1.5, -1.5, 0.5, -1, 1];

export default function KeywordsStage({ keywords, activeIndex }: Props) {
  const refs = useRef<(HTMLDivElement|null)[]>([]);
  useEffect(() => {
    refs.current[activeIndex]?.scrollIntoView({ behavior:"smooth", block:"nearest" });
  }, [activeIndex]);
  if (!keywords.length) return null;

  return (
    <section style={{ animation:"fadeUp 0.5s ease forwards", opacity:0 }}>
      <div style={{
        background:"rgba(255,255,255,0.85)", backdropFilter:"blur(16px)",
        WebkitBackdropFilter:"blur(16px)",
        border:"1.5px solid rgba(232,221,208,0.7)", borderRadius:26,
        boxShadow:"0 4px 24px rgba(44,31,15,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
        overflow:"hidden",
      }}>
        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          padding:"13px 22px", borderBottom:"1px solid rgba(232,221,208,0.5)",
          background:"rgba(245,240,232,0.4)",
        }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#C4A882" }}/>
          <span style={{ fontSize:11, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"1.2px", color:"#9B7B5A" }}>
            Concetti chiave
          </span>
          <span style={{ marginLeft:"auto", fontSize:11, fontFamily:"'DM Sans',sans-serif", color:"#C4A882" }}>
            {Math.min(activeIndex+1, keywords.length)} / {keywords.length}
          </span>
        </div>

        {/* Keywords */}
        <div style={{ padding:"28px 24px 20px", display:"flex", flexWrap:"wrap", gap:12, justifyContent:"center", minHeight:150, alignItems:"center" }}>
          {keywords.map((kw, i) => {
            const c = COLORS[i % COLORS.length];
            const isActive = i === activeIndex;
            const isDone   = i < activeIndex;
            return (
              <div
                key={i}
                ref={el => { refs.current[i] = el; }}
                style={{
                  padding:"8px 20px", borderRadius:18,
                  border:`1.5px solid ${isActive ? "rgba(126,200,227,0.8)" : c.border}`,
                  fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800,
                  fontSize: SIZES[i % SIZES.length],
                  lineHeight:1.1,
                  background: isActive
                    ? "linear-gradient(135deg, #7EC8E3 0%, #5BB8D8 100%)"
                    : isDone ? "rgba(245,240,232,0.5)" : c.bg,
                  color:     isActive ? "#fff" : isDone ? "#C4A882" : c.text,
                  opacity:   isDone ? 0.4 : 1,
                  transform: isActive
                    ? "scale(1.1) rotate(0deg)"
                    : isDone ? `scale(0.92) rotate(${ROTATIONS[i%ROTATIONS.length]}deg)`
                    : `scale(1) rotate(${ROTATIONS[i%ROTATIONS.length]*0.3}deg)`,
                  transition:"all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                  boxShadow: isActive
                    ? "0 0 0 4px rgba(126,200,227,0.2), 0 8px 20px rgba(126,200,227,0.3)"
                    : "none",
                  backdropFilter:"blur(4px)",
                  userSelect:"none",
                  cursor:"default",
                }}
              >
                {kw}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        {activeIndex >= 0 && (
          <div style={{ padding:"0 24px 18px", display:"flex", gap:4, justifyContent:"center", alignItems:"center" }}>
            {keywords.map((_,i) => (
              <div key={i} style={{
                height:4, borderRadius:999, transition:"all 0.35s ease",
                width: i===activeIndex ? 20 : 4,
                background: i===activeIndex ? "#7EC8E3" : i<activeIndex ? "rgba(196,168,130,0.6)" : "rgba(232,221,208,0.8)",
              }}/>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}