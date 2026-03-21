"use client";
import { useState, useRef, useCallback } from "react";

interface Props { onResult: (simplified: string, keywords: string[]) => void; }

type Mode = "text" | "pdf";

export default function InputSection({ onResult }: Props) {
  const [mode, setMode]         = useState<Mode>("pdf");
  const [text, setText]         = useState("");
  const [focused, setFocused]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // PDF state
  const [dragging, setDragging]   = useState(false);
  const [pdfFile, setPdfFile]     = useState<File | null>(null);
  const [pdfInfo, setPdfInfo]     = useState<{ pages:number; chars:number; text:string } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError]   = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX = 6000;
  const canSubmit = (mode === "text" ? text.trim().length > 20 : !!pdfInfo) && !loading;
  const pct = Math.min(text.length / MAX, 1);

  // ── PDF handling ─────────────────────────────────────────
  async function processPdf(file: File) {
    if (file.type !== "application/pdf") {
      setPdfError("Il file deve essere un PDF"); return;
    }
    setPdfLoading(true); setPdfError(""); setPdfFile(file); setPdfInfo(null);
    try {
      const form = new FormData();
      form.append("pdf", file);
      const res  = await fetch("/api/extract-pdf", { method:"POST", body:form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPdfInfo({ pages:data.pages, chars:data.chars, text:data.text });
    } catch(e:any) {
      setPdfError(e.message);
      setPdfFile(null);
    } finally {
      setPdfLoading(false);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processPdf(file);
    e.target.value = "";
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processPdf(file);
  }, []);

  function removePdf() { setPdfFile(null); setPdfInfo(null); setPdfError(""); }

  // ── Simplify ──────────────────────────────────────────────
  async function handleSimplify() {
    if (!canSubmit) return;
    setLoading(true); setError("");
    const inputText = mode === "pdf" && pdfInfo ? pdfInfo.text : text;
    try {
      const res  = await fetch("/api/simplify", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore sconosciuto");
      onResult(data.simplified, data.keywords);
    } catch(e:any) { setError(e.message); }
    finally        { setLoading(false); }
  }

  // ── Styles ────────────────────────────────────────────────
  const S: Record<string, React.CSSProperties> = {
    wrap:   { animation:"fadeUp 0.6s 0.1s ease forwards", opacity:0 },

    // Mode toggle
    toggle: {
      display:"flex", gap:4, padding:4,
      background:"rgba(232,221,208,0.35)", borderRadius:16,
      marginBottom:14,
    },
    tabBtnBase: {
      flex:1, padding:"9px 16px", borderRadius:12, border:"none",
      fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:700,
      cursor:"pointer", transition:"all 0.18s ease",
    } as React.CSSProperties,
    tabBtnActive: {
      background:"#fff", color:"#1A6482",
      boxShadow:"0 2px 10px rgba(44,31,15,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
    } as React.CSSProperties,
    tabBtnInactive: {
      background:"transparent", color:"#9B7B5A", boxShadow:"none",
    } as React.CSSProperties,

    // Card
    card: {
      background:"rgba(255,255,255,0.9)", backdropFilter:"blur(16px)",
      WebkitBackdropFilter:"blur(16px)",
      border: focused ? "1.5px solid rgba(126,200,227,0.6)" : "1.5px solid rgba(232,221,208,0.8)",
      borderRadius:26,
      boxShadow: focused
        ? "0 0 0 4px rgba(126,200,227,0.12), 0 8px 32px rgba(44,31,15,0.1)"
        : "0 4px 24px rgba(44,31,15,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
      overflow:"hidden", transition:"border-color 0.2s, box-shadow 0.2s",
    },
    topBar: {
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"14px 22px", borderBottom:"1px solid rgba(232,221,208,0.5)",
      background:"rgba(245,240,232,0.4)",
    },
    dotRow: { display:"flex", alignItems:"center", gap:8 },
    dot:    { width:7, height:7, borderRadius:"50%", background: focused ? "#2E8FAD" : "#C4A882", transition:"background 0.2s" },
    label:  { fontSize:11, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"1.2px", color:"#9B7B5A" },
    progWrap:{ display:"flex", alignItems:"center", gap:10 },
    progBar: { width:60, height:3, borderRadius:99, background:"rgba(232,221,208,0.6)", overflow:"hidden" },
    progFill:{ height:"100%", borderRadius:99, background: pct>0.9?"#E8935A":"#7EC8E3", width:`${pct*100}%`, transition:"width 0.3s, background 0.3s" },
    progTxt: { fontSize:11, fontFamily:"'DM Sans',sans-serif", fontWeight:500, color:"#C4A882", minWidth:40, textAlign:"right" as const },

    // Drop zone
    dropZone: {
      margin:20, borderRadius:20,
      border: dragging ? "2px dashed #2E8FAD" : pdfFile ? "2px solid rgba(126,200,227,0.4)" : "2px dashed rgba(196,168,130,0.4)",
      background: dragging ? "rgba(214,238,245,0.2)" : pdfFile ? "rgba(214,238,245,0.1)" : "rgba(245,240,232,0.3)",
      padding: pdfFile ? "0" : "48px 24px",
      textAlign:"center" as const, cursor: pdfFile ? "default" : "pointer",
      transition:"all 0.2s ease", minHeight: pdfFile ? 0 : 200,
      display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", gap:12,
    },

    // PDF icon
    pdfIcon: {
      width:56, height:56, borderRadius:20,
      background:"linear-gradient(135deg, #D6EEF5, #B8E0F0)",
      display:"flex", alignItems:"center", justifyContent:"center",
      boxShadow:"0 4px 16px rgba(126,200,227,0.3)",
      margin:"0 auto",
    },

    // PDF preview (after upload)
    pdfPreview: {
      display:"flex", alignItems:"center", gap:14,
      padding:"16px 20px",
    },
    pdfThumb: {
      width:48, height:60, borderRadius:10, flexShrink:0,
      background:"linear-gradient(135deg, #E8F4FB, #D0E8F5)",
      border:"1px solid rgba(126,200,227,0.3)",
      display:"flex", alignItems:"center", justifyContent:"center",
      boxShadow:"0 2px 8px rgba(126,200,227,0.2)",
    },
    pdfMeta: { flex:1, minWidth:0 },
    pdfName: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:14, color:"#2C1F0F", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const },
    pdfSub:  { fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#9B7B5A", marginTop:3 },
    pdfBadge:{ display:"inline-flex", alignItems:"center", gap:4, marginTop:5, padding:"2px 10px", borderRadius:20, background:"rgba(74,222,128,0.12)", border:"1px solid rgba(74,222,128,0.3)", fontSize:11, fontFamily:"'DM Sans',sans-serif", color:"#16A34A", fontWeight:600 },
    removeBtn:{ width:32, height:32, borderRadius:10, border:"1px solid rgba(232,221,208,0.8)", background:"rgba(245,240,232,0.5)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#C4A882", fontSize:16, transition:"all 0.15s", flexShrink:0 },

    ta: {
      width:"100%", minHeight:200, padding:"20px 22px 16px",
      border:"none", outline:"none",
      fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:400,
      color:"#2C1F0F", background:"transparent", lineHeight:1.75, resize:"none" as const,
    },
    botBar: {
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"12px 22px 14px", borderTop:"1px solid rgba(232,221,208,0.5)",
      background:"rgba(245,240,232,0.2)",
    },
    hint:  { fontSize:12, fontFamily:"'DM Sans',sans-serif", color:"rgba(196,168,130,0.7)" },
    btn:   {
      display:"flex", alignItems:"center", gap:8,
      padding:"12px 26px", borderRadius:18, border:"none",
      fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, fontWeight:700,
      cursor: canSubmit ? "pointer" : "not-allowed",
      background: canSubmit ? "linear-gradient(135deg, #1A6482 0%, #2E8FAD 100%)" : "#E8DDD0",
      color: canSubmit ? "#fff" : "#9B7B5A",
      boxShadow: canSubmit ? "0 4px 16px rgba(26,100,130,0.3), inset 0 1px 0 rgba(255,255,255,0.15)" : "none",
      transition:"all 0.18s cubic-bezier(0.34,1.56,0.64,1)", outline:"none",
    },
    spinner: { width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" },
    error:   { marginTop:10, padding:"13px 18px", background:"rgba(254,242,242,0.9)", backdropFilter:"blur(8px)", border:"1px solid rgba(252,165,165,0.5)", color:"#991B1B", fontSize:13, fontFamily:"'DM Sans',sans-serif", borderRadius:18, animation:"fadeUp 0.3s ease forwards" },
    shimBox: { marginTop:14, display:"flex", flexDirection:"column" as const, gap:9 },
    shimRow: { height:13, borderRadius:99, background:"linear-gradient(90deg,#F5F0E8 25%,#EDE5D8 50%,#F5F0E8 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite" },
  };

  return (
    <section style={S.wrap}>
      {/* Mode toggle */}
      <div style={S.toggle}>
        <button style={{...S.tabBtnBase,...(mode==="pdf"?S.tabBtnActive:S.tabBtnInactive)}} onClick={()=>setMode("pdf")}>
          📄 Carica PDF
        </button>
        <button style={{...S.tabBtnBase,...(mode==="text"?S.tabBtnActive:S.tabBtnInactive)}} onClick={()=>setMode("text")}>
          ✏️ Incolla testo
        </button>
      </div>

      <div style={S.card}>
        {/* Top bar */}
        <div style={S.topBar}>
          <div style={S.dotRow}>
            <div style={S.dot}/>
            <span style={S.label}>{mode==="pdf" ? "Carica il tuo PDF" : "Il tuo testo"}</span>
          </div>
          {mode==="text" && (
            <div style={S.progWrap}>
              <div style={S.progBar}><div style={S.progFill}/></div>
              <span style={S.progTxt}>{(MAX-text.length).toLocaleString()}</span>
            </div>
          )}
          {mode==="pdf" && pdfInfo && (
            <span style={{ fontSize:11, fontFamily:"'DM Sans',sans-serif", color:"#9B7B5A" }}>
              {pdfInfo.pages} pagine · {(pdfInfo.chars/1000).toFixed(1)}k caratteri
            </span>
          )}
        </div>

        {/* PDF mode */}
        {mode==="pdf" && (
          <>
            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" style={{ display:"none" }} onChange={handleFileInput}/>

            {!pdfFile ? (
              <div
                style={S.dropZone}
                onClick={()=>fileInputRef.current?.click()}
                onDragOver={e=>{e.preventDefault();setDragging(true);}}
                onDragLeave={()=>setDragging(false)}
                onDrop={handleDrop}
              >
                {pdfLoading ? (
                  <>
                    <div style={{ width:40, height:40, border:"3px solid rgba(126,200,227,0.2)", borderTop:"3px solid #7EC8E3", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#9B7B5A" }}>Lettura del PDF...</p>
                  </>
                ) : (
                  <>
                    <div style={S.pdfIcon}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2E8FAD" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="12" y1="12" x2="12" y2="18"/>
                        <line x1="9" y1="15" x2="15" y2="15"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:15, color:"#2C1F0F", marginBottom:4 }}>
                        {dragging ? "Rilascia qui il PDF" : "Trascina il PDF qui"}
                      </p>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#9B7B5A" }}>
                        oppure <span style={{ color:"#2E8FAD", fontWeight:600, textDecoration:"underline" }}>seleziona il file</span>
                      </p>
                    </div>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#C4A882" }}>
                      PDF · max 20MB
                    </p>
                  </>
                )}
                {pdfError && (
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#DC2626", marginTop:4 }}>⚠ {pdfError}</p>
                )}
              </div>
            ) : (
              /* PDF preview */
              <div style={S.pdfPreview}>
                <div style={S.pdfThumb}>
                  <svg width="22" height="28" viewBox="0 0 24 32" fill="none">
                    <rect width="24" height="32" rx="3" fill="#D6EEF5"/>
                    <rect x="3" y="8" width="18" height="2" rx="1" fill="#7EC8E3" opacity="0.6"/>
                    <rect x="3" y="13" width="14" height="2" rx="1" fill="#7EC8E3" opacity="0.6"/>
                    <rect x="3" y="18" width="16" height="2" rx="1" fill="#7EC8E3" opacity="0.6"/>
                    <rect x="3" y="23" width="10" height="2" rx="1" fill="#7EC8E3" opacity="0.6"/>
                    <path d="M16 0 L24 8 L16 8 Z" fill="rgba(126,200,227,0.3)"/>
                  </svg>
                </div>
                <div style={S.pdfMeta}>
                  <div style={S.pdfName}>{pdfFile.name}</div>
                  <div style={S.pdfSub}>{pdfInfo?.pages} pagine · {(pdfFile.size/1024).toFixed(0)} KB</div>
                  {pdfInfo && (
                    <div style={S.pdfBadge}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Testo estratto — pronto
                    </div>
                  )}
                </div>
                <button
                  style={S.removeBtn}
                  onClick={removePdf}
                  onMouseEnter={e=>{(e.currentTarget).style.background="rgba(254,242,242,0.8)";(e.currentTarget).style.color="#DC2626";(e.currentTarget).style.borderColor="rgba(252,165,165,0.5)";}}
                  onMouseLeave={e=>{(e.currentTarget).style.background="rgba(245,240,232,0.5)";(e.currentTarget).style.color="#C4A882";(e.currentTarget).style.borderColor="rgba(232,221,208,0.8)";}}
                  title="Rimuovi"
                >
                  ✕
                </button>
              </div>
            )}
          </>
        )}

        {/* Text mode */}
        {mode==="text" && (
          <textarea
            style={S.ta}
            value={text}
            onChange={e=>setText(e.target.value.slice(0,MAX))}
            onFocus={()=>setFocused(true)}
            onBlur={()=>setFocused(false)}
            onKeyDown={e=>{if((e.metaKey||e.ctrlKey)&&e.key==="Enter")handleSimplify();}}
            placeholder={"Incolla qui sbobine, appunti, capitoli di libro o slide...\n\nCOCO li rispiegherà come un professore universitario."}
          />
        )}

        {/* Bottom bar */}
        <div style={S.botBar}>
          <span style={S.hint}>
            {mode==="text" ? "⌘ + Enter per semplificare" : pdfInfo ? `${pdfInfo.chars.toLocaleString()} caratteri estratti` : "Carica un PDF per iniziare"}
          </span>
          <button
            onClick={handleSimplify}
            disabled={!canSubmit}
            style={S.btn}
            onMouseEnter={e=>{if(canSubmit){(e.currentTarget).style.transform="translateY(-1px)";(e.currentTarget).style.boxShadow="0 8px 24px rgba(26,100,130,0.35), inset 0 1px 0 rgba(255,255,255,0.15)";}}}
            onMouseLeave={e=>{(e.currentTarget).style.transform="";(e.currentTarget).style.boxShadow=canSubmit?"0 4px 16px rgba(26,100,130,0.3), inset 0 1px 0 rgba(255,255,255,0.15)":"none";}}
            onMouseDown={e=>{(e.currentTarget).style.transform="scale(0.97)";}}
            onMouseUp={e=>{(e.currentTarget).style.transform="";}}
          >
            {loading
              ? <><div style={S.spinner}/><span>Elaboro...</span></>
              : <><span style={{fontSize:16}}>✦</span><span>Rispega</span></>
            }
          </button>
        </div>
      </div>

      {error && <div style={S.error}>⚠ {error}</div>}

      {loading && (
        <div style={S.shimBox}>
          {[0.8,1,0.9,0.7,0.85].map((w,i)=>(
            <div key={i} style={{...S.shimRow, width:`${w*100}%`, animationDelay:`${i*0.08}s`}}/>
          ))}
        </div>
      )}
    </section>
  );
}