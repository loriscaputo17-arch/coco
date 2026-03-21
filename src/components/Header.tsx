"use client";

export default function Header() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        .header-logo:hover { opacity: 0.8; }
        .header-link:hover { color: #1A6482 !important; }
      `}</style>
      <header style={{
        width: "100%",
        borderBottom: "1px solid rgba(232,221,208,0.6)",
        backgroundColor: "rgba(250,250,247,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: 700, margin: "0 auto", padding: "12px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <div className="header-logo" style={{ display:"flex", alignItems:"center", gap:10, cursor:"default", transition:"opacity 0.2s" }}>
            <div style={{
              width:38, height:38, borderRadius:14,
              background:"linear-gradient(135deg, #D6EEF5 0%, #B8E0F0 100%)",
              border:"1px solid rgba(126,200,227,0.4)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 2px 12px rgba(126,200,227,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8" fill="#7EC8E3" opacity="0.2"/>
                <circle cx="12" cy="12" r="5" fill="#2E8FAD"/>
                <ellipse cx="12" cy="8.5" rx="2.5" ry="3.5" fill="#1A6482" opacity="0.9"/>
                <circle cx="12" cy="12" r="1.5" fill="white" opacity="0.6"/>
              </svg>
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
              <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:900, fontSize:24, letterSpacing:"-1px", color:"#2C1F0F" }}>
                coco
              </span>
              <span style={{
                fontSize:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600,
                color:"#9B7B5A", background:"#F5F0E8",
                border:"1px solid rgba(196,168,130,0.3)",
                padding:"2px 8px", borderRadius:20,
                letterSpacing:"0.5px", textTransform:"uppercase",
              }}>
                beta
              </span>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <p className="header-link" style={{ fontSize:13, fontFamily:"'DM Sans',sans-serif", fontStyle:"italic", color:"#C4A882", transition:"color 0.2s", cursor:"default" }}>
              studia meglio, non di più
            </p>
            <div style={{
              width:8, height:8, borderRadius:"50%",
              background:"#4ADE80",
              boxShadow:"0 0 0 3px rgba(74,222,128,0.2)",
              animation:"pulseDot 2s ease-in-out infinite",
            }}/>
          </div>
        </div>
      </header>
    </>
  );
}