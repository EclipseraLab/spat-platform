"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type GameKey = "spat_blocks" | "spat_bounce" | "spat_strike";
const gameInfo: Record<GameKey, { title: string; tagline: string; instructions: string; icon: string; accent: string }> = {
  spat_blocks: { title: "SPAT Blocks", tagline: "STACK THE GRID", instructions: "Tap the blocks as they light up. Each hit adds 10 points. You have 30 seconds.", icon: "▦", accent: "gold" },
  spat_bounce: { title: "SPAT Bounce", tagline: "KEEP IT IN PLAY", instructions: "Tap to bounce the orb. Time your taps while the pulse is in the scoring zone.", icon: "◉", accent: "blue" },
  spat_strike: { title: "SPAT Strike", tagline: "HIT THE TARGET", instructions: "Wait for the target to appear, then hit it quickly. Each accurate strike adds 25 points.", icon: "✳", accent: "violet" }
};

export default function SpatGamesClient({ initialGp, initialWeeklyGp }: { initialGp: number; initialWeeklyGp: number }) {
  const [game, setGame] = useState<GameKey>("spat_blocks");
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(4);
  const [pulse, setPulse] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [gp, setGp] = useState(initialGp);
  const [weeklyGp, setWeeklyGp] = useState(initialWeeklyGp);
  const [runId, setRunId] = useState("");
  const [strikeReadyAt, setStrikeReadyAt] = useState(0);
  const [reaction, setReaction] = useState<number | null>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
      setSeconds(Math.max(0, 30 - elapsed));
      setPulse((v) => (v + 1) % 100);
      if (elapsed >= 30) setPlaying(false);
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (!playing || game !== "spat_strike") return;
    const delay = 700 + Math.floor(Math.random() * 1800);
    const timeout = window.setTimeout(() => setStrikeReadyAt(Date.now()), delay);
    return () => window.clearTimeout(timeout);
  }, [playing, game, score]);

  function startGame(nextGame = game) {
    setGame(nextGame);
    setScore(0);
    setSeconds(30);
    setTarget(Math.floor(Math.random() * 9));
    setPulse(0);
    setReaction(null);
    setStrikeReadyAt(0);
    setMessage("");
    setRunId(crypto.randomUUID());
    startedAt.current = Date.now();
    setPlaying(true);
  }

  function hitBlocks(index: number) {
    if (!playing || game !== "spat_blocks") return;
    setTarget(Math.floor(Math.random() * 9));
    setScore((s) => s + (index === target ? 10 : 2));
  }

  function bounce() {
    if (!playing || game !== "spat_bounce") return;
    const timing = pulse % 20;
    const points = timing >= 7 && timing <= 12 ? 15 : 5;
    setScore((s) => s + points);
    setMessage(points === 15 ? "Perfect timing +15" : "+5 — time your tap with the blue pulse");
  }

  function strike() {
    if (!playing || game !== "spat_strike") return;
    if (!strikeReadyAt) {
      setMessage("Too early — wait for the target to light up.");
      setScore((s) => Math.max(0, s - 5));
      return;
    }
    const ms = Date.now() - strikeReadyAt;
    setReaction(ms);
    setStrikeReadyAt(0);
    setScore((s) => s + (ms < 450 ? 25 : ms < 800 ? 15 : 8));
    setMessage(ms < 450 ? "Lightning strike!" : "Good hit!");
  }

  async function claimScore() {
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("submit_game_score", {
        p_game_key: game,
        p_score: Math.min(2500, Math.max(0, score)),
        p_idempotency_key: runId || crypto.randomUUID()
      });
      if (error) throw error;
      const result = Array.isArray(data) ? data[0] : data;
      if (!result?.success) throw new Error("Score could not be saved.");
      setGp(Number(result.gp_balance ?? gp));
      setWeeklyGp(Number(result.weekly_gp_earned ?? weeklyGp));
      setMessage(result.reason === "weekly_cap_reached"
        ? `Run saved. You earned ${result.gp_awarded} GP; the weekly cap has been reached.`
        : `Run saved! +${result.gp_awarded} GP added to your balance.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save this run. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const info = gameInfo[game];
  const progress = Math.min(100, weeklyGp / 10000 * 100);
  return <div className="games-layout">
    <section className="games-hero">
      <div className="games-hero-copy"><p className="games-eyebrow">SPAT ARCADE / PLAYER ZONE</p><h1>Play the game.<br/><span>Build your score.</span></h1><p>Three quick skill games. Earn Game Points (GP) for each completed run, with a shared weekly limit of 10,000 GP.</p><div className="games-hero-pills"><span>● AUTHENTICATED PLAY</span><span>↗ SCORES SAVED TO YOUR ACCOUNT</span></div></div>
      <div className="games-orbit" aria-hidden="true"><div className="games-orbit-ring ring-a"/><div className="games-orbit-ring ring-b"/><div className="games-orbit-core">ϟ</div><span className="games-orbit-label">PLAY / EARN / REPEAT</span></div>
    </section>
    <section className="games-wallet-row">
      <article className="games-wallet-card"><span>YOUR GAME POINTS</span><strong>{gp.toLocaleString("en-US")} <small>GP</small></strong><p>Current account balance</p></article>
      <article className="games-wallet-card games-wallet-card--weekly"><div className="games-wallet-top"><span>WEEKLY GP CAP</span><b>{weeklyGp.toLocaleString("en-US")} / 10,000</b></div><div className="games-progress"><span style={{width: `${progress}%`}}/></div><p>{Math.max(0, 10000 - weeklyGp).toLocaleString("en-US")} GP remaining this week</p></article>
    </section>
    <section className="games-section">
      <div className="games-section-heading"><div><p className="games-eyebrow">CHOOSE YOUR CHALLENGE</p><h2>The arcade<span>.</span></h2></div><span className="games-live-tag"><i/> 3 GAMES AVAILABLE</span></div>
      <div className="games-select-grid">{(Object.keys(gameInfo) as GameKey[]).map((key, i) => <button key={key} className={`games-select-card ${game === key ? "selected" : ""} ${gameInfo[key].accent}`} onClick={() => { setPlaying(false); setGame(key); setScore(0); setSeconds(30); setMessage(""); }}><span className="games-select-number">0{i + 1}</span><span className="games-select-icon">{gameInfo[key].icon}</span><strong>{gameInfo[key].title}</strong><small>{gameInfo[key].tagline}</small><span className="games-select-arrow">↗</span></button>)}</div>
    </section>
    <section className={`games-play-panel ${info.accent}`}>
      <div className="games-play-head"><div><p className="games-eyebrow">{info.tagline}</p><h2>{info.title}</h2><p>{info.instructions}</p></div><div className="games-timer"><small>TIME LEFT</small><strong>00:{String(seconds).padStart(2,"0")}</strong></div></div>
      {game === "spat_blocks" && <div className="blocks-grid" aria-label="Tap the highlighted block grid">{Array.from({length:9},(_,i)=><button aria-label={`Block ${i+1}`} key={i} disabled={!playing} onClick={()=>hitBlocks(i)} className={i===target?"lit":""}>{i===target?"✦":""}</button>)}</div>}
      {game === "spat_bounce" && <button disabled={!playing} className="bounce-field" onClick={bounce}><span className="bounce-zone"/><span className="bounce-orb" style={{left:`${8 + (pulse % 20) * 4.2}%`}}/><strong>TAP TO BOUNCE</strong><small>Best timing scores more</small></button>}
      {game === "spat_strike" && <button disabled={!playing} className={`strike-field ${strikeReadyAt?"strike-ready":""}`} onClick={strike}><span>{strikeReadyAt?"✹":"＋"}</span><strong>{strikeReadyAt?"STRIKE NOW":"WAIT FOR THE TARGET"}</strong><small>{reaction !== null ? `Last reaction: ${reaction} ms` : "React as quickly as you can"}</small></button>}
      <div className="games-score-row"><div><small>YOUR SCORE</small><strong>{score.toLocaleString("en-US")}</strong></div><div><small>ESTIMATED GP</small><strong>{Math.min(score, Math.max(0,10000-weeklyGp)).toLocaleString("en-US")} <em>GP</em></strong></div>{!playing ? <button className="games-start-button" onClick={()=>startGame(game)}>{seconds===0?"Play again":"Start 30-sec run"} <span>→</span></button> : <span className="games-playing-label"><i/> RUN IN PROGRESS</span>}</div>
      {!playing && seconds===0 && <div className="games-finish"><p>Run complete. Submit your score to save your GP.</p><button disabled={busy} onClick={claimScore}>{busy?"Saving score…":"Save score & claim GP"} <span>→</span></button></div>}
      {message && <p className="games-message" role="status">{message}</p>}
      <p className="games-integrity-note">Scores are submitted to the SPAT server. A run can be submitted only once, and GP rewards stop at the shared weekly cap.</p>
    </section>
    <p className="games-rules-note"><strong>How GP works:</strong> Earn GP by playing. The shared limit is 10,000 GP per week across SPAT Blocks, SPAT Bounce, and SPAT Strike. GP carries forward; 1,000 GP converts to 1 SP under the SPAT points rules.</p>
  </div>;
}
