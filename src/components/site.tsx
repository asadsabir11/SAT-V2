"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const PUBLIC_NAV = [["O Level", "/o-level"], ["SAT Prep", "/founder-cohort"], ["Scholarships", "/scholarship"], ["For Parents", "/parent-webinar"]] as const;

type AuthUser = { name: string; role: "student" | "founder" | "parent" | "teacher"; program?: "sat" | "o-level" } | null;

function AuthBadge({ onUser }: { onUser?: (u: AuthUser) => void }) {
  const [user, setUser] = useState<AuthUser>(null);
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      const u = d.user ?? null;
      setUser(u);
      onUser?.(u);
    }).catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (!user) {
    return (
      <Link href="/login" style={{padding:"8px 16px",borderRadius:999,background:"#eaf1ff",color:"#155eef",fontWeight:800,fontSize:".82rem",border:"1.5px solid #d0e0ff",whiteSpace:"nowrap",textDecoration:"none"}}>
        Login
      </Link>
    );
  }

  const first = user.name.split(" ")[0];
  const href = (user.role === "founder" || user.role === "teacher") ? "/admin" : user.role === "parent" ? "/parent" : "/dashboard";
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:6}}>
      <Link href={href} style={{display:"inline-flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:999,background:"#eaf1ff",color:"#1551c7",fontWeight:800,fontSize:".82rem",border:"1.5px solid #d0e0ff",whiteSpace:"nowrap",textDecoration:"none"}}>
        <span style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#155eef,#18a999)",color:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:".78rem",fontWeight:900,flexShrink:0}}>
          {first[0].toUpperCase()}
        </span>
        {user.role === "founder" ? "Admin" : first}
      </Link>
      <button onClick={logout} style={{padding:"7px 12px",borderRadius:999,background:"transparent",border:"1.5px solid #e2e8f0",color:"#6b7c93",fontWeight:700,fontSize:".78rem",cursor:"pointer",whiteSpace:"nowrap"}}>
        Logout
      </button>
    </div>
  );
}
const FOOTER_EXPLORE=[["Home","/"],["SAT Prep","/founder-cohort"],["Scholarships","/scholarship"],["Register","/register"],["Login","/login"],["For Parents","/parent-webinar"],["Contact Us","/contact"],["Privacy Policy","/privacy"],["Terms of Service","/terms"]] as const;
const FOOTER_MARKETS=["Pakistan","Bangladesh","Nigeria","Indonesia","Malaysia","S. Korea","Haiti"];

export function Header() {
  const [user, setUser] = useState<AuthUser>(null);
  const pathname = usePathname();
  const isOLevel = pathname?.startsWith("/o-level") ?? false;
  // A signed-in student only needs a nav link into the program they're NOT
  // currently in — their own program is already where they are (dashboard,
  // header badge, etc). Unknown program (older session, or non-student
  // roles) shows both, same as signed-out visitors. A signed-in parent
  // doesn't need either marketing page at all — they're here for their
  // child's reports, not to browse cohorts — so only "For Parents" stays.
  const navItems = user?.role === "parent"
    ? PUBLIC_NAV.filter(([, href]) => href !== "/o-level" && href !== "/founder-cohort")
    : user?.role === "student" && user.program
    ? PUBLIC_NAV.filter(([, href]) => user.program === "o-level" ? href !== "/founder-cohort" : href !== "/o-level")
    : PUBLIC_NAV;
  return (
    <header style={{borderBottom:"1px solid #e8eef6",background:"rgba(255,255,255,.96)",position:"sticky",top:0,zIndex:30,backdropFilter:"blur(16px)"}}>
      <div className="container" style={{minHeight:70,display:"flex",alignItems:"center",justifyContent:"space-between",gap:20}}>
        <Link href="/" style={{fontWeight:900,color:"#071b33",letterSpacing:"-.04em",fontSize:"1.05rem",flexShrink:0}}>
          <span style={{color:"#155eef"}}>The Digital</span> Tutor
        </Link>
        <nav style={{display:"flex",gap:6,alignItems:"center",fontSize:".88rem",fontWeight:700,overflowX:"auto"}}>
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} style={{padding:"8px 12px",borderRadius:10,color:"#2d4261",transition:".16s",whiteSpace:"nowrap"}}>{label}</Link>
          ))}
          <AuthBadge onUser={setUser} />
          {!user && (
            isOLevel ? (
              <Link href="/o-level#apply" className="btn btn-primary" style={{minHeight:40,padding:"0 18px",fontSize:".88rem",marginLeft:4}}>
                Register Free →
              </Link>
            ) : (
              <Link href="/register?plan=Core" className="btn btn-primary" style={{minHeight:40,padding:"0 18px",fontSize:".88rem",marginLeft:4}}>
                Join cohort →
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer(){
  const pathname = usePathname();
  const isOLevel = pathname?.startsWith("/o-level") ?? false;
  const [user, setUser] = useState<AuthUser>(null);
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setUser(d.user ?? null)).catch(() => {});
  }, []);
  const isSignedInStudent = user?.role === "student";
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
              {isOLevel && (
                <Link className="footer-link" href="/o-level/refund-policy">Refund & Cancellation Policy</Link>
              )}
            </nav>
          </div>

          {/* Get Started */}
          <div>
            <p className="footer-col-title">Get Started</p>
            {isOLevel ? (
              isSignedInStudent ? (
                <>
                  <p style={{color:"#a8c0d8",fontSize:".88rem",lineHeight:1.7,marginBottom:20}}>
                    Welcome back — head to your dashboard to browse subjects or unlock a new one.
                  </p>
                  <Link href="/dashboard" className="footer-cta-btn footer-cta-primary">Go to My Dashboard →</Link>
                </>
              ) : (
                <>
                  <p style={{color:"#a8c0d8",fontSize:".88rem",lineHeight:1.7,marginBottom:20}}>
                    Register free for O Level English Language and Mathematics — pay only when you unlock a subject.
                  </p>
                  <Link href="/o-level#apply" className="footer-cta-btn footer-cta-primary">Register Free →</Link>
                </>
              )
            ) : (
              <>
                <p style={{color:"#a8c0d8",fontSize:".88rem",lineHeight:1.7,marginBottom:20}}>
                  Create a free account to access the diagnostic, AI tutor, and your personal dashboard.
                </p>
                <Link href="/register" className="footer-cta-btn footer-cta-primary">Get started free →</Link>
                <Link href="/register?plan=Core" className="footer-cta-btn footer-cta-secondary">Join the cohort</Link>
              </>
            )}
            <p style={{color:"#4e6a88",fontSize:".78rem",marginTop:16,lineHeight:1.5}}>
              Cohort seats open · Limited seats
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{borderTop:"1px solid rgba(255,255,255,.09)",padding:"22px 0",display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <p style={{color:"#4e6a88",fontSize:".76rem",margin:0,maxWidth:680,lineHeight:1.65}}>
            {isOLevel
              ? "The Digital Tutor is an independent tuition provider and is not affiliated with or endorsed by Cambridge University Press & Assessment. Cambridge O Level and IGCSE are qualifications of Cambridge University Press & Assessment — no examination grade is guaranteed."
              : "SAT® is a trademark registered by the College Board, which is not affiliated with and does not endorse The Digital Tutor. Independent preparation support — no official affiliation, endorsement, or score guarantee. All practice content is original."}
          </p>
          <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
            <p style={{color:"#4e6a88",fontSize:".76rem",margin:0,whiteSpace:"nowrap"}}>© 2026 The Digital Tutor</p>
            <Link href="/privacy" style={{color:"#4e6a88",fontSize:".76rem",whiteSpace:"nowrap",textDecoration:"none"}}>Privacy Policy</Link>
            <Link href="/terms" style={{color:"#4e6a88",fontSize:".76rem",whiteSpace:"nowrap",textDecoration:"none"}}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

type CTAVariant = "primary" | "secondary" | "accent" | "ghost";
const CTA_VARIANT_CLASS: Record<CTAVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-teal",
  ghost: "btn-ghost",
};

export function CTAButton({href,children,secondary=false,variant,className}:{href:string;children:ReactNode;secondary?:boolean;variant?:CTAVariant;className?:string}){
  const resolved = variant ?? (secondary ? "secondary" : "primary");
  const classes = `btn ${CTA_VARIANT_CLASS[resolved]}${className?` ${className}`:""}`;
  return <Link href={href} className={classes}>{children}</Link>;
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
  const label=name==="Free"?"Start free →":"Enroll now →";
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

export function PageHero({eyebrow,title,children,actions,backHref,backLabel}:{eyebrow:string;title:string;children:ReactNode;actions?:ReactNode;backHref?:string;backLabel?:string}){
  return (
    <section className="page-hero">
      <div className="container">
        {backHref && (
          <Link href={backHref} style={{ display: "inline-block", marginBottom: 14, color: "#6b7c93", fontSize: ".82rem", fontWeight: 600, textDecoration: "none" }}>
            ← {backLabel ?? "Back"}
          </Link>
        )}
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
