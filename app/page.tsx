"use client";

import { useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Award, Bell, Brain,
  CalendarDays, Check, ChevronRight, CircleHelp, Flame, Gamepad2, Gift,
  LayoutDashboard, LogOut, Menu, MessageCircle, Plus, ShieldCheck, Sparkles,
  Target, Trophy, Users, Wallet, X, Zap
} from "lucide-react";

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Daily Pulse", icon: Brain, tag: "5 Qs" },
  { label: "Missions", icon: Target, tag: "3" },
  { label: "Weekly League", icon: Trophy },
  { label: "Community", icon: Users },
  { label: "Games", icon: Gamepad2, soon: true }
];

const tasks = [
  { title: "Daily check-in", detail: "Show up and keep your streak alive", points: "+3 SP", icon: Flame, status: "Ready" },
  { title: "Weekly crypto pulse", detail: "5 questions · refreshed every Monday", points: "Up to 50 SP", icon: Brain, status: "Start quiz" },
  { title: "Community signal boost", detail: "Complete a social task for SPAT", points: "+5 SP", icon: MessageCircle, status: "Explore" }
];

const league = [
  { rank: "01", name: "NovaRunner", handle: "@novarunner", points: "1,240", initials: "N", color: "violet" },
  { rank: "02", name: "blockbloom", handle: "@blockbloom", points: "1,080", initials: "B", color: "blue" },
  { rank: "03", name: "You", handle: "@spatmember", points: "960", initials: "Y", color: "gold" },
  { rank: "04", name: "0xMira", handle: "@0xmira", points: "840", initials: "M", color: "pink" }
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [checkedIn, setCheckedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const activePoints = checkedIn ? "963" : "960";

  function handleNav(label: string) {
    setActiveNav(label);
    setMenuOpen(false);
    if (label !== "Overview") {
      setNotice(label === "Games" ? "Games are planned for a later phase. Your SP and GP balances will remain separate." : `${label} is part of the SPAT MVP. This preview uses sample data while the backend is being connected.`);
    } else {
      setNotice("");
    }
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <button className="brand" onClick={() => handleNav("Overview")} aria-label="SPAT home">
          <span className="brand-mark"><Zap size={20} fill="currentColor" /></span>
          <span className="brand-word">SPAT<span className="brand-period">.</span><small>DAILY ONCHAIN ENERGY</small></span>
        </button>
        <div className="workspace-label">YOUR SPACE</div>
        <nav className="side-nav">
          {navItems.map(({ label, icon: Icon, tag, soon }) => (
            <button key={label} onClick={() => handleNav(label)} className={`nav-item ${activeNav === label ? "active" : ""}`}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {tag && <span className="nav-tag">{tag}</span>}
              {soon && <span className="soon-tag">SOON</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-card">
          <div className="sidebar-card-icon"><Sparkles size={17} /></div>
          <p className="sidebar-card-title">Small moves.<br /><span>Big momentum.</span></p>
          <p className="sidebar-card-copy">Your next level starts with showing up today.</p>
          <button className="sidebar-card-link" onClick={() => setNotice("Keep coming back daily to build your streak. Rewards are subject to the final SPAT rules.")}>How it works <ArrowRight size={14} /></button>
        </div>
        <div className="sidebar-footer"><span className="status-dot" /> SPAT preview <span className="version">v0.1</span></div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="breadcrumb"><span>SPAT SPACE</span><ChevronRight size={14} /><strong>{activeNav.toUpperCase()}</strong></div>
          <div className="topbar-actions">
            <span className="network-pill"><span className="status-dot" /> COMMUNITY MODE</span>
            <button className="icon-button" aria-label="Notifications" onClick={() => setNotice("You're all caught up. New mission and review notifications will appear here.")}><Bell size={18} /><i /></button>
            <button className="profile-button" onClick={() => setShowProfile(!showProfile)}><span className="avatar avatar-gold">Y</span><span className="profile-label">SPAT Member<small>Explorer</small></span><ChevronRight size={14} /></button>
            {showProfile && <div className="profile-popover"><strong>SPAT Member</strong><span>Demo profile · wallet not connected</span><button onClick={() => { setShowProfile(false); setNotice("Account settings will be available after authentication is connected."); }}>Account settings <ArrowRight size={14} /></button><button onClick={() => { setShowProfile(false); setNotice("You're viewing a local interface preview."); }}><LogOut size={14} /> Sign out preview</button></div>}
          </div>
        </header>

        <div className="content">
          {notice && <div className="notice-banner"><CircleHelp size={17} /><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notice"><X size={16} /></button></div>}
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> WEDNESDAY, YOUR NEXT MOVE STARTS HERE</div>
              <h1>Welcome, SPAT Member<span className="blue-dot">.</span></h1>
              <p className="welcome-copy">Every day is a fresh chance to show up, level up, and move with the community.</p>
            </div>
            <div className="week-pill"><CalendarDays size={16} /><span>WEEK 43</span><span className="week-divider" /> <span>MON — SUN</span></div>
          </section>

          <section className="hero-card">
            <div className="hero-grid" />
            <div className="hero-content">
              <div className="hero-kicker"><span className="hero-spark"><Sparkles size={14} /></span> YOUR MOMENTUM, MEASURED</div>
              <h2>Keep showing up.<br /><span>Keep stacking.</span></h2>
              <p>Small actions add up. Complete today's activities and keep your momentum going.</p>
              <button className={`primary-button ${checkedIn ? "button-done" : ""}`} onClick={() => {
                if (!checkedIn) { setCheckedIn(true); setNotice("Preview only: +3 SP displayed for the check-in. No points have been saved to a server yet."); }
              }} disabled={checkedIn}>
                {checkedIn ? <><Check size={16} /> Checked in today</> : <>Check in for +3 SP <ArrowRight size={16} /></>}
              </button>
              <div className="hero-footnote"><ShieldCheck size={13} /> Wallet not required · Join with your account</div>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
              <div className="hero-core"><span className="core-ring"><Zap size={36} fill="currentColor" /></span><span className="core-caption">SHOW UP<br />STACK POINTS</span></div>
              <div className="float-chip chip-one"><Flame size={14} /><span>STREAK</span><b>07 DAYS</b></div>
              <div className="float-chip chip-two"><Sparkles size={14} /><span>DAILY ENERGY</span><b>+3 SP</b></div>
              <div className="visual-dot dot-one" /><div className="visual-dot dot-two" /><div className="visual-dot dot-three" />
            </div>
            <div className="hero-index">SPAT / 001</div>
          </section>

          <section className="stats-grid">
            <article className="stat-card balance-card">
              <div className="stat-top"><span className="stat-label">SPAT POINTS <span className="info-dot">i</span></span><span className="stat-icon blue-icon"><Zap size={17} /></span></div>
              <div className="stat-value">{activePoints}<span>SP</span></div>
              <div className="stat-bottom"><span className="positive"><ArrowUpRight size={14} /> +12%</span><span>vs. last week</span><span className="stat-bottom-end">All-time <strong>2,840 SP</strong></span></div>
              <div className="mini-chart"><span style={{height:"28%"}}/><span style={{height:"40%"}}/><span style={{height:"34%"}}/><span style={{height:"51%"}}/><span style={{height:"46%"}}/><span style={{height:"64%"}}/><span style={{height:"56%"}}/><span style={{height:"78%"}}/><span style={{height:"67%"}}/><span style={{height:"92%"}}/><span style={{height:"80%"}}/><span style={{height:"100%"}}/></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-label">CURRENT STREAK</span><span className="stat-icon gold-icon"><Flame size={17} /></span></div>
              <div className="stat-value">07<span>days</span></div>
              <div className="stat-bottom"><span className="gold-text"><Flame size={14} /> On fire</span><span>Best: 12 days</span></div>
              <div className="streak-week"><span className="day done">M<Check size={11}/></span><span className="day done">T<Check size={11}/></span><span className="day today">W<Flame size={11}/></span><span className="day">T</span><span className="day">F</span><span className="day">S</span><span className="day">S</span></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-label">WEEKLY RANK</span><span className="stat-icon purple-icon"><Trophy size={17} /></span></div>
              <div className="stat-value">#03<span> / 128</span></div>
              <div className="stat-bottom"><span className="positive"><ArrowUpRight size={14} /> +2 places</span><span>You're climbing</span></div>
              <div className="rank-progress"><span style={{width:"74%"}}/></div><div className="progress-caption"><span>Top 3% this week</span><span>74% to next tier</span></div>
            </article>
          </section>

          <section className="section-heading">
            <div><div className="eyebrow">YOUR DAILY LOOP</div><h2>Make today count<span className="blue-dot">.</span></h2></div>
            <button className="text-link" onClick={() => handleNav("Missions")}>View all activities <ArrowRight size={15} /></button>
          </section>

          <section className="activity-grid">
            {tasks.map(({title, detail, points, icon: Icon, status}, index) => (
              <article className="activity-card" key={title}>
                <div className={`activity-icon activity-icon-${index}`}><Icon size={19} /></div>
                <div className="activity-title-row"><h3>{title}</h3><span className="points-pill">{points}</span></div>
                <p>{detail}</p>
                <button className="activity-action" onClick={() => {
                  if (index === 0) {
                    if (!checkedIn) { setCheckedIn(true); setNotice("Preview only: check-in UI updated. The backend is not connected yet."); }
                    else setNotice("You've already checked in in this preview.");
                  } else if (index === 1) handleNav("Daily Pulse");
                  else handleNav("Missions");
                }}>{index === 0 && checkedIn ? "Completed" : status} <ArrowRight size={14} /></button>
              </article>
            ))}
          </section>

          <section className="lower-grid">
            <article className="panel-card league-card">
              <div className="panel-heading"><div><div className="eyebrow">WEEKLY COMPETITION</div><h2>League leaders</h2></div><button className="square-link" onClick={() => handleNav("Weekly League")} aria-label="Open weekly league"><ArrowUpRight size={17} /></button></div>
              <div className="league-meta"><span><span className="live-dot" /> LIVE THIS WEEK</span><span>Resets in 4d 08h</span></div>
              <div className="league-list">
                {league.map((person) => <div className={`league-row ${person.name === "You" ? "your-row" : ""}`} key={person.rank}>
                  <span className={`rank-number ${person.rank === "01" ? "rank-first" : ""}`}>{person.rank}</span>
                  <span className={`avatar avatar-${person.color}`}>{person.initials}</span>
                  <span className="league-name">{person.name}<small>{person.handle}</small></span>
                  <strong className="league-points">{person.points}<small>SP</small></strong>
                </div>)}
              </div>
              <button className="full-width-link" onClick={() => handleNav("Weekly League")}>View full leaderboard <ArrowRight size={15} /></button>
            </article>

            <article className="panel-card missions-card">
              <div className="panel-heading"><div><div className="eyebrow">QUICK WINS</div><h2>Mission board</h2></div><span className="mission-count">02 <small>/ 04</small></span></div>
              <div className="mission-progress"><span style={{width:"50%"}}/></div>
              <p className="mission-progress-copy">You're halfway through your weekly missions.</p>
              <div className="mission-item"><span className="mission-check complete"><Check size={14} /></span><span className="mission-text">Visit the SPAT dashboard<small>Daily mission</small></span><strong>+2 SP</strong></div>
              <div className="mission-item"><span className="mission-check complete"><Check size={14} /></span><span className="mission-text">Keep your streak alive<small>Weekly mission</small></span><strong>+5 SP</strong></div>
              <div className="mission-item"><span className="mission-check"><span/></span><span className="mission-text">Complete the crypto pulse<small>Weekly mission</small></span><strong>+5 SP</strong></div>
              <div className="mission-item"><span className="mission-check"><span/></span><span className="mission-text">Support a community post<small>Social mission</small></span><strong>+5 SP</strong></div>
              <button className="full-width-link" onClick={() => handleNav("Missions")}>Open mission board <ArrowRight size={15} /></button>
            </article>
          </section>

          <section className="bottom-banner">
            <div className="banner-icon"><Gift size={20} /></div>
            <div><strong>Your consistency has value.</strong><p>Earn SP through participation today. Future token or airdrop plans, if any, are not guaranteed.</p></div>
            <button onClick={() => setNotice("SPAT is still in development. Token plans and conversion rules will be announced only if officially confirmed.")}>Explore rewards <ArrowRight size={15} /></button>
          </section>

          <footer className="footer"><span>© 2026 SPAT PROTOCOL <i>·</i> BUILT FOR THE EVERYDAY PARTICIPANT</span><span><span className="status-dot" /> SYSTEM PREVIEW <i>·</i> <button onClick={() => setNotice("SPAT is an early product preview. Balances, rankings, streaks, and missions shown here are sample values, not real rewards.")}>About this preview</button></span></footer>
        </div>
      </section>
    </main>
  );
}
