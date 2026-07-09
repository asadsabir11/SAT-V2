"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const NAV_LINKS=[["Program","/founder-cohort"],["Diagnostic","/diagnostic"],["AI Tutor","/ai-tutor"],["For Parents","/parent-webinar"],["Partners","/partners"],["Dashboard","/dashboard"]] as const;

function StudentNavBadge(){
  const [name, setName] = useState<string|null>(null);
  useEffect(()=>{
    const n = localStorage.getItem("sat_student_name");
    if(n) setName(n.split(" ")[0]);
  },[]);
  if(!name) return null;
  return (
    <Link href="/dashboard" style={{display:"inline-flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:999,background:"#eaf1ff",color:"#1551c7",fontWeight:800,fontSize:".82rem",border:"1.5px solid #d0e0ff",whiteSpace:"nowrap"}}>
      <span style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#155eef,#18a999)",color:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:".78rem",fontWeight:900,flexShrink:0}}>
        {name[0].toUpperCase()}
      </span>
      {name}
    </Link>
  );
}
const FOOTER_EXPLORE=[["Home","/"],["Founder Cohort","/founder-cohort"],["Free Diagnostic","/diagnostic"],["AI Tutor","/ai-tutor"],["For Parents","/parent-webinar"],["School & NGO Partners","/partners"],["Contact Us","/contact"]] as const;
const FOOTER_MARKETS=["Pakistan","Bangladesh","Nigeria","Indonesia","Malaysia","S. Korea","Haiti"];

export function Header(){
  return (
    <header style={{borderBottom:"1px solid #e8eef6",background:"rgba(255,255,255,.96)",position:"sticky",top:0,zIndex:30,backdropFilter:"blur(16px)"}}>
      <div className="container" style={{minHeight:70,display:"flex",alignItems:"center",justifyContent:"space-between",gap:20}}>
        <Link href="/" style={{fontWeight:900,color:"#071b33",letterSpacing:"-.04em",fontSize:"1.05rem",flexShrink:0}}>
          <span style={{color:"#155eef"}}>The Digital</span> Tutor
        </Link>
        <nav style={{display:"flex",gap:6,alignItems:"center",fontSize:".88rem",fontWeight:700,overflowX:"auto"}}>
          {NAV_LINKS.map(([label,href])=>(
            label==="Dashboard"
              ? <Link key={href} href={href} style={{padding:"8px 14px",borderRadius:999,color:"#155eef",background:"#eaf1ff",border:"1.5px solid #d0e0ff",fontWeight:800,fontSize:".85rem",whiteSpace:"nowrap",transition:".16s"}}>My Dashboard</Link>
              : <Link key={href} href={href} style={{padding:"8px 12px",borderRadius:10,color:"#2d4261",transition:".16s",whiteSpace:"nowrap"}}>{label}</Link>
          ))}
          <StudentNavBadge />
          <Link href="/register?plan=Founder" className="btn btn-primary" style={{minHeight:40,padding:"0 18px",fontSize:".88rem",marginLeft:4}}>
            Join cohort →
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer(){
  return (
    <footer className="band" style={{padding:0}}>
      <div style={{height:3,background:"linear-gradient(90deg,#155eef 0%,#18a999 100%)"}}/>
      <div className="container" style={{paddingTop:64}}>
        <div className="footer-main-grid" style={{display:"grid",gridTemplateColumns:"1.7fr 1fr 1.2fr",gap:56,paddingBottom:60}}>

          {/* Brand */}
          <div>
            <Link href="/" style={{fontWeight:900,fontSize:"1.2rem",letterSpacing:"-.04em",display:"block",marginBottom:16,color:"#fff"}}>
              <span style={{color:"#5eead4"}}>The Digital</span> Tutor
            </Link>
            <p style={{color:"#a8c0d8",lineHeight:1.8,marginBottom:16,maxWidth:310,fontSize:".92rem"}}>
              Affordable accountability for ambitious global students preparing for university, AI literacy, and a changing world.
            </p>
            <p style={{color:"#6a8aaa",fontSize:".8rem",marginBottom:22,lineHeight:1.6}}>
              Founded by{" "}
              <strong style={{color:"#a8c0d8",fontWeight:700}}>Ibrahim Malick</strong>
              {" "}— technology executive, educator, and AI specialist.
            </p>
            <div style={{marginTop:4}}>
              {FOOTER_MARKETS.map(m=><span className="footer-market" key={m}>{m}</span>)}
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="footer-col-title">Explore</p>
            <nav className="footer-nav">
              {FOOTER_EXPLORE.map(([label,href])=>(
                <Link className="footer-link" key={label} href={href}>{label}</Link>
              ))}
            </nav>
          </div>

          {/* Get Started */}
          <div>
            <p className="footer-col-title">Get Started</p>
            <p style={{color:"#a8c0d8",fontSize:".88rem",lineHeight:1.7,marginBottom:20}}>
              Take the free 10-minute diagnostic to see where you stand — no registration required.
            </p>
            <Link href="/diagnostic" className="footer-cta-btn footer-cta-primary">Take free diagnostic →</Link>
            <Link href="/register?plan=Founder" className="footer-cta-btn footer-cta-secondary">Join founder cohort</Link>
            <p style={{color:"#4e6a88",fontSize:".78rem",marginTop:16,lineHeight:1.5}}>
              Founder cohort open · Limited seats
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{borderTop:"1px solid rgba(255,255,255,.09)",padding:"22px 0",display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <p style={{color:"#4e6a88",fontSize:".76rem",margin:0,maxWidth:680,lineHeight:1.65}}>
            SAT® is a trademark registered by the College Board, which is not affiliated with and does not endorse The Digital Tutor. Independent preparation support — no official affiliation, endorsement, or score guarantee. All practice content is original.
          </p>
          <p style={{color:"#4e6a88",fontSize:".76rem",margin:0,whiteSpace:"nowrap"}}>© 2026 The Digital Tutor</p>
        </div>
      </div>
    </footer>
  );
}

export function CTAButton({href,children,secondary=false}:{href:string;children:ReactNode;secondary?:boolean}){
  return <Link href={href} className={`btn ${secondary?"btn-secondary":"btn-primary"}`}>{children}</Link>;
}

export function FeatureCard({index,title,children}:{index:string;title:string;children:ReactNode}){
  return (
    <article className="card">
      {index&&<div className="icon">{index}</div>}
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

export function PricingCard({name,price,items,href,recommended=false}:{name:string;price:string;items:string[];href:string;recommended?:boolean}){
  const label=name==="Free"?"Start free →":name==="Sponsored / NGO"?"Partner with us →":name==="Premium"?"Apply for premium →":"Join founder cohort →";
  return (
    <article className={`card${recommended?" recommended":""}`} style={{display:"flex",flexDirection:"column"}}>
      <span className="eyebrow" style={{marginBottom:4}}>{name}</span>
      <div className="price">{price}</div>
      <ul style={{flex:1,paddingLeft:20,margin:"14px 0 22px",display:"grid",gap:6}}>
        {items.map(x=><li key={x} style={{color:"#4a6070",fontSize:".92rem"}}>{x}</li>)}
      </ul>
      <CTAButton href={href}>{label}</CTAButton>
    </article>
  );
}

export function PageHero({eyebrow,title,children,actions}:{eyebrow:string;title:string;children:ReactNode;actions?:ReactNode}){
  return (
    <section className="page-hero">
      <div className="container">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="title" style={{maxWidth:860}}>{title}</h1>
        <div className="lead">{children}</div>
        {actions&&<div className="actions">{actions}</div>}
      </div>
    </section>
  );
}

export function FAQAccordion({items}:{items:[string,string][]}){
  return (
    <div style={{marginTop:8}}>
      {items.map(([q,a])=>(
        <details key={q}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}

export function DashboardCard({label,value,detail,progress}:{label:string;value:string;detail?:string;progress?:number}){
  return (
    <article className="card">
      <div className="eyebrow">{label}</div>
      <div className="metric">{value}</div>
      {detail&&<p style={{marginTop:6}}>{detail}</p>}
      {progress!==undefined&&<div className="progress"><span style={{width:`${progress}%`}}/></div>}
    </article>
  );
}

export function DisclaimerBanner(){
  return <div className="note">Independent preparation support. No official affiliation, endorsement, or score guarantee. All practice examples are original.</div>;
}

// Pass videoSrc="/welcome.mp4" for a local file, or youtubeId="ABC123" for YouTube
export function VideoBox({ youtubeId, videoSrc }: { youtubeId?: string; videoSrc?: string }) {
  const [playing, setPlaying] = useState(false);

  if (videoSrc && playing) {
    return (
      <div style={{ borderRadius: 24, overflow: "hidden", aspectRatio: "16/9", background: "#000", boxShadow: "0 24px 64px rgba(7,27,51,.2)" }}>
        <video
          src={videoSrc}
          controls
          autoPlay
          style={{ width: "100%", height: "100%", display: "block", outline: "none" }}
        />
      </div>
    );
  }

  if (youtubeId && playing) {
    return (
      <div style={{ borderRadius: 24, overflow: "hidden", aspectRatio: "16/9", background: "#000", boxShadow: "0 24px 64px rgba(7,27,51,.2)" }}>
        <iframe
          width="100%" height="100%"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 0, display: "block", width: "100%", height: "100%" }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => (youtubeId || videoSrc) && setPlaying(true)}
      style={{
        borderRadius: 24, overflow: "hidden", aspectRatio: "16/9", position: "relative",
        background: "linear-gradient(145deg,#0b2340 0%,#071b33 55%,#0d2e4a 100%)",
        boxShadow: "0 24px 64px rgba(7,27,51,.22),0 6px 20px rgba(7,27,51,.14)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: (youtubeId || videoSrc) ? "pointer" : "default",
      }}
    >
      {/* Subtle grid pattern */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
      {/* Teal glow */}
      <div style={{ position: "absolute", bottom: -40, right: -40, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(#18a99930,transparent 70%)", pointerEvents: "none" }} />
      {/* Blue glow */}
      <div style={{ position: "absolute", top: -40, left: -20, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(#155eef28,transparent 70%)", pointerEvents: "none" }} />

      {/* Play button */}
      <div style={{
        width: 80, height: 80, borderRadius: "50%", marginBottom: 28, position: "relative", zIndex: 1,
        background: (youtubeId||videoSrc) ? "linear-gradient(135deg,#155eef,#18a999)" : "rgba(255,255,255,.1)",
        border: (youtubeId||videoSrc) ? "none" : "2px solid rgba(255,255,255,.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: (youtubeId||videoSrc) ? "0 12px 32px rgba(21,94,239,.4)" : "none",
        transition: "transform .2s",
      }}>
        <div style={{ width: 0, height: 0, borderTop: "14px solid transparent", borderBottom: "14px solid transparent", borderLeft: `${(youtubeId||videoSrc) ? "24px" : "20px"} solid ${(youtubeId||videoSrc) ? "#fff" : "rgba(255,255,255,.5)"}`, marginLeft: 6 }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 32px" }}>
        <p style={{ color: "#5eead4", fontSize: ".72rem", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", margin: "0 0 10px", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <span style={{ display: "inline-block", width: 14, height: 2, background: "#5eead4", borderRadius: 2 }} />
          Welcome from the founder
          <span style={{ display: "inline-block", width: 14, height: 2, background: "#5eead4", borderRadius: 2 }} />
        </p>
        <h3 style={{ color: "#fff", fontSize: "clamp(1.2rem,2.5vw,1.75rem)", fontWeight: 900, margin: "0 0 10px", letterSpacing: "-.03em", lineHeight: 1.15 }}>
          A message from Ibrahim Malick
        </h3>
        <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".9rem", margin: "0 0 6px" }}>
          Founder, The Digital Tutor · Technology executive, educator, AI specialist
        </p>
        {!(youtubeId || videoSrc) && (
          <span style={{ display: "inline-block", marginTop: 14, padding: "6px 16px", borderRadius: 999, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.45)", fontSize: ".78rem", fontWeight: 700, letterSpacing: ".06em" }}>
            VIDEO COMING SOON
          </span>
        )}
      </div>
    </div>
  );
}
