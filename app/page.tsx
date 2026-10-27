import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, ArrowUpRight, Activity, BrainCircuit, Flame, Gamepad2, ShieldCheck, Sparkles, Target, Trophy, WalletCards, Zap } from "lucide-react";

const paths = [
  { n: "01", icon: Flame, title: "Daily Check-in", detail: "Build a consistent habit", reward: "3 SP / day", href: "/dashboard", tone: "lime" },
  { n: "02", icon: BrainCircuit, title: "Daily Pulse", detail: "Put your Web3 knowledge to work", reward: "Weekly quiz", href: "/daily-pulse", tone: "blue" },
  { n: "03", icon: Target, title: "Missions", detail: "Complete platform challenges", reward: "Earn SP", href: "/missions", tone: "violet" },
  { n: "04", icon: Gamepad2, title: "SPAT Arcade", detail: "Play games and build GP", reward: "Earn GP", href: "/games", tone: "gold" }
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return <main className="spat-home">
    <div className="spat-home-noise" aria-hidden="true" />
    <header className="spat-home-header">
      <Link href="/" className="spat-home-brand" aria-label="SPAT home"><span className="spat-home-mark">S</span><span>SPAT<span className="spat-home-period">.</span><small>PARTICIPATION PROTOCOL</small></span></Link>
      <nav className="spat-home-nav" aria-label="Main navigation"><a href="#protocol">Protocol</a><a href="#activities">Activities</a><a href="#points">Points system</a></nav>
      <div className="spat-home-actions"><Link href="/login" className="spat-home-login">Log in</Link><Link href="/signup" className="spat-home-join">Launch app <ArrowUpRight size={15}/></Link></div>
    </header>

    <section className="spat-home-hero">
      <div className="spat-home-copy">
        <div className="spat-home-kicker"><i/> WEB3 PARTICIPATION LAYER <span>· LIVE</span></div>
        <h1>Your activity.<br/><em>Your momentum.</em></h1>
        <p>One place to show up, complete onchain-culture challenges, sharpen your Web3 knowledge, and track your SPAT progress.</p>
        <div className="spat-home-hero-actions"><Link href="/signup" className="spat-home-primary">Enter SPAT <ArrowRight size={17}/></Link><a href="#protocol" className="spat-home-secondary">Explore the protocol <span>↓</span></a></div>
        <div className="spat-home-proof"><span><ShieldCheck size={15}/> Free to join</span><span><WalletCards size={15}/> No wallet required</span></div>
      </div>
      <div className="spat-home-console">
        <div className="spat-console-top"><span><i/> SPAT / MEMBER TERMINAL</span><span className="spat-console-status">SYSTEM ONLINE</span></div>
        <div className="spat-console-title"><div><small>YOUR PARTICIPATION LAYER</small><h2>Make every<br/>session count<span>.</span></h2></div><div className="spat-console-orb"><span>S</span><i/><b/></div></div>
        <div className="spat-console-metrics"><div><small>POINTS TRACKED</small><strong>SP <span>+</span> GP</strong></div><div><small>WAYS TO PARTICIPATE</small><strong>04 <span>PATHS</span></strong></div></div>
        <div className="spat-console-list">{paths.slice(0,3).map((p)=>{const Icon=p.icon;return <Link href={p.href} key={p.n}><span className={"spat-console-icon "+p.tone}><Icon size={17}/></span><span className="spat-console-item"><b>{p.title}</b><small>{p.detail}</small></span><span className="spat-console-reward">{p.reward}</span><ArrowUpRight size={14}/></Link>})}</div>
        <div className="spat-console-foot"><span><Activity size={13}/> PARTICIPATION FIRST</span><span>BUILT TO GROW ↗</span></div>
      </div>
      <div className="spat-home-index"><span>01 / SHOW UP</span><span>02 / TAKE PART</span><span>03 / STACK POINTS</span></div>
    </section>

    <section className="spat-home-strip"><span><Sparkles size={16}/> CONSISTENCY OVER HYPE</span><i/><span><Zap size={16}/> SMALL ACTIONS ADD UP</span><i/><span><ShieldCheck size={16}/> CLEAR REWARD RULES</span></section>

    <section className="spat-home-section" id="protocol"><div className="spat-home-section-head"><div><div className="spat-home-kicker">THE SPAT LOOP</div><h2>Simple by design.<br/><em>Built for momentum.</em></h2></div><p>SPAT brings your participation into one clear member space. Know where to go, what to do, and how points are tracked.</p></div>
      <div className="spat-home-steps"><article><span>01 / JOIN</span><div className="spat-step-icon"><WalletCards size={21}/></div><h3>Create your account</h3><p>Set up your member profile and start without connecting a wallet.</p></article><article><span>02 / PARTICIPATE</span><div className="spat-step-icon"><Target size={21}/></div><h3>Choose your path</h3><p>Check in, complete missions, play games, and test your knowledge.</p></article><article><span>03 / PROGRESS</span><div className="spat-step-icon"><Trophy size={21}/></div><h3>Track what you earn</h3><p>Follow your SP and GP balances from your personal dashboard.</p></article></div>
    </section>

    <section className="spat-home-section spat-home-activities" id="activities"><div className="spat-home-section-head"><div><div className="spat-home-kicker">YOUR MEMBER TOOLKIT</div><h2>Four paths.<br/><em>One home base.</em></h2></div><p>Pick an activity and return to your dashboard whenever you want. Your account is the centre of your SPAT experience.</p></div>
      <div className="spat-home-paths">{paths.map((p)=>{const Icon=p.icon;return <Link href={p.href} className="spat-home-path" key={p.n}><div className="spat-path-top"><span>{p.n} / 04</span><span className={"spat-path-icon "+p.tone}><Icon size={20}/></span></div><h3>{p.title}</h3><p>{p.detail}</p><div className="spat-path-bottom"><span>{p.reward}</span><ArrowUpRight size={16}/></div></Link>})}</div>
    </section>

    <section className="spat-home-points" id="points"><div className="spat-points-symbol">S<span>+</span></div><div><div className="spat-home-kicker">A CLEAR POINTS MODEL</div><h2>Progress you can<br/><em>actually follow.</em></h2><p>SP tracks platform participation. GP tracks arcade activity. Balances and rewards are displayed in your account, with the rules explained in context. SPAT does not promise future token value, airdrops, or conversion unless officially announced.</p><Link href="/signup" className="spat-home-secondary">Start your SPAT account <ArrowRight size={16}/></Link></div><div className="spat-points-cards"><div><small>PARTICIPATION</small><strong>SP <span>↗</span></strong><p>Missions, check-ins, and eligible activities.</p></div><div><small>ARCADE</small><strong>GP <span>↗</span></strong><p>Game activity with its own point balance.</p></div></div></section>

    <section className="spat-home-cta"><div className="spat-home-kicker">YOUR NEXT MOVE</div><h2>Show up. Stack points.</h2><p>Build your Web3 participation habit with SPAT.</p><Link href="/signup" className="spat-home-primary">Create your account <ArrowRight size={17}/></Link></section>
    <footer className="spat-home-footer"><Link href="/" className="spat-home-brand"><span className="spat-home-mark">S</span><span>SPAT<span className="spat-home-period">.</span><small>PARTICIPATION PROTOCOL</small></span></Link><span>PARTICIPATION FIRST · © 2026 SPAT</span><div><Link href="/login">Log in</Link><Link href="/signup">Create account</Link></div></footer>
  </main>;
}
