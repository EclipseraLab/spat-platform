import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, BrainCircuit,
  CheckCircle2, CircleDollarSign, Flame, Gamepad2, Menu, ShieldCheck,
  Sparkles, Target, Trophy, Users, Zap
} from "lucide-react";

const activities = [
  { number: "01", icon: Flame, title: "Daily check-in", copy: "Build a rhythm with a simple daily action.", reward: "Consistency" },
  { number: "02", icon: BrainCircuit, title: "Daily Pulse", copy: "Test your crypto knowledge with a fresh weekly set.", reward: "Knowledge" },
  { number: "03", icon: Target, title: "Missions", copy: "Complete platform and community tasks for points.", reward: "Progress" },
  { number: "04", icon: Trophy, title: "Weekly League", copy: "Track your progress and compete with the community.", reward: "Competition" }
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");
  return (
    <main className="landing">
      <header className="landing-header">
        <Link href="/" className="landing-brand" aria-label="SPAT home">
          <span className="landing-brand-mark">ϟ</span><span>SPAT<span className="landing-brand-period">.</span><small>SHOW UP. STACK POINTS.</small></span>
        </Link>
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#activities">Activities</a>
          <a href="#principles">Our approach</a>
        </nav>
        <div className="landing-actions">
          <Link className="landing-login" href="/login">Log in</Link>
          <Link className="landing-button landing-button-small" href="/signup">Get started <ArrowUpRight size={15}/></Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <div className="landing-eyebrow"><span className="landing-live-dot"/> YOUR DAILY WEB3 ROUTINE</div>
          <h1>Small actions.<br/><span>Real momentum.</span></h1>
          <p className="landing-lede">Make your daily Web3 habit count. Take on crypto challenges, complete missions, earn SPAT Points, and grow alongside the community.</p>
          <div className="landing-hero-actions">
            <Link className="landing-button" href="/signup">Start for free <ArrowRight size={17}/></Link>
            <a className="landing-text-link" href="#how-it-works">See how it works <ArrowDownRight size={16}/></a>
          </div>
          <div className="landing-trust-row"><span><CheckCircle2 size={15}/> Free to join</span><span><CheckCircle2 size={15}/> No wallet required</span><span><CheckCircle2 size={15}/> Start at your pace</span></div>
        </div>
        <div className="landing-visual" aria-label="Illustration of the SPAT points dashboard">
          <div className="landing-orbit landing-orbit-one"/><div className="landing-orbit landing-orbit-two"/>
          <div className="landing-glow"/>
          <div className="landing-dashboard-card">
            <div className="landing-card-top"><span className="landing-mini-brand"><span>ϟ</span> SPAT</span><span className="landing-pill"><i/> YOUR JOURNEY</span></div>
            <div className="landing-card-label">YOUR PARTICIPATION</div>
            <div className="landing-card-headline">Make today<br/>count<span>.</span></div>
            <div className="landing-progress-row"><span>Weekly momentum</span><strong>Keep going</strong></div>
            <div className="landing-progress"><span/></div>
            <div className="landing-activity-list">
              <div><span className="landing-activity-icon mint"><Flame size={17}/></span><span><b>Daily check-in</b><small>Keep your streak moving</small></span><strong>+3 SP</strong></div>
              <div><span className="landing-activity-icon blue"><BrainCircuit size={17}/></span><span><b>Daily Pulse</b><small>Put your knowledge to work</small></span><strong>+SP</strong></div>
              <div><span className="landing-activity-icon violet"><Target size={17}/></span><span><b>Daily missions</b><small>One step at a time</small></span><strong>+SP</strong></div>
            </div>
            <div className="landing-card-bottom"><span><span className="landing-live-dot"/> BUILT AROUND PARTICIPATION</span><ArrowUpRight size={15}/></div>
          </div>
          <div className="landing-float landing-float-top"><span className="landing-float-icon"><Zap size={17}/></span><span><b>Stay consistent</b><small>Progress adds up</small></span></div>
          <div className="landing-float landing-float-bottom"><span className="landing-trophy"><Trophy size={18}/></span><span><b>Weekly League</b><small>Find your place</small></span></div>
        </div>
        <div className="landing-hero-index"><span>01 — PARTICIPATE</span><span>02 — EARN POINTS</span><span>03 — KEEP GROWING</span></div>
      </section>

      <section className="landing-strip" aria-label="SPAT principles">
        <div><Sparkles size={17}/><span>PARTICIPATION FIRST</span></div><i/><div><Users size={17}/><span>COMMUNITY POWERED</span></div><i/><div><Trophy size={17}/><span>PROGRESS YOU CAN TRACK</span></div><i/><div><ShieldCheck size={17}/><span>BUILT WITH CLARITY</span></div>
      </section>

      <section className="landing-section landing-how" id="how-it-works">
        <div className="landing-section-intro"><div className="landing-eyebrow">A SIMPLE LOOP THAT ADDS UP</div><h2>Make showing up<br/>your <span>advantage.</span></h2><p>SPAT is designed to make participation feel clear, rewarding, and worth coming back to.</p></div>
        <div className="landing-steps">
          <article><span className="landing-step-num">01</span><div className="landing-step-icon"><Users size={21}/></div><h3>Create your account</h3><p>Get started with an account. You don't need to connect a wallet to participate.</p><span className="landing-step-foot">START HERE <ArrowUpRight size={14}/></span></article>
          <article><span className="landing-step-num">02</span><div className="landing-step-icon"><Target size={21}/></div><h3>Take part daily</h3><p>Check in, answer crypto questions, and work through available missions.</p><span className="landing-step-foot">TAKE ACTION <ArrowUpRight size={14}/></span></article>
          <article><span className="landing-step-num">03</span><div className="landing-step-icon"><Trophy size={21}/></div><h3>Build your momentum</h3><p>Collect SPAT Points and follow your progress as you take part over time.</p><span className="landing-step-foot">KEEP GROWING <ArrowUpRight size={14}/></span></article>
        </div>
      </section>

      <section className="landing-section landing-activities" id="activities">
        <div className="landing-section-heading"><div><div className="landing-eyebrow">YOUR SPAT ROUTINE</div><h2>Different ways to <span>move forward.</span></h2></div><p>Start with one activity. Build from there. New opportunities can be introduced as SPAT develops.</p></div>
        <div className="landing-activity-grid">{activities.map((item) => { const Icon = item.icon; return <article key={item.number} className="landing-feature"><div className="landing-feature-top"><span className="landing-feature-icon"><Icon size={20}/></span><span>{item.number} / 04</span></div><h3>{item.title}</h3><p>{item.copy}</p><div className="landing-feature-foot"><span>{item.reward}</span><ArrowUpRight size={16}/></div></article>; })}</div>
        <div className="landing-game-note"><span className="landing-game-icon"><Gamepad2 size={19}/></span><span><b>SPAT Arcade is open.</b><small>Play arcade challenges including Minesweeper, 2048, Crypto Trivia and more to build your Game Points.</small></span><Link className="landing-roadmap-tag" href="/games">PLAY GAMES ↗</Link></div>
      </section>

      <section className="landing-principles" id="principles">
        <div className="landing-principles-mark">ϟ</div>
        <div><div className="landing-eyebrow">BUILT FOR THE LONG GAME</div><h2>Clear participation.<br/><span>No empty promises.</span></h2><p>SPAT Points track participation within the platform. Any future token, airdrop, or conversion plan is subject to official confirmation and is not guaranteed. We want you to understand what you're doing, what you earn, and what is still being developed.</p><Link className="landing-text-link" href="/signup">Join the community <ArrowRight size={16}/></Link></div>
        <div className="landing-principles-side"><div><ShieldCheck size={19}/><span><b>Clarity first</b><small>Know what is live and what is planned.</small></span></div><div><CircleDollarSign size={19}/><span><b>Points, not promises</b><small>Rewards are explained without guaranteeing future value.</small></span></div><div><BadgeCheck size={19}/><span><b>Start without a wallet</b><small>Join first. Explore at your own pace.</small></span></div></div>
      </section>

      <section className="landing-cta"><div className="landing-cta-orb"/><div className="landing-eyebrow">YOUR NEXT STEP STARTS HERE</div><h2>Ready to show up?</h2><p>Build a habit. Take part. Stack your SPAT Points.</p><Link className="landing-button" href="/signup">Create your free account <ArrowRight size={17}/></Link><small>No wallet needed to get started.</small></section>

      <footer className="landing-footer"><Link href="/" className="landing-brand"><span className="landing-brand-mark">ϟ</span><span>SPAT<span className="landing-brand-period">.</span><small>SHOW UP. STACK POINTS.</small></span></Link><p>Built for the everyday participant.</p><div><Link href="/login">Log in</Link><Link href="/signup">Create account</Link><a href="#how-it-works">How it works</a></div><span className="landing-copyright">© 2026 SPAT. Participation first.</span></footer>
    </main>
  );
}
