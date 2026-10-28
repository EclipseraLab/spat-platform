import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { claimDailyMission, signOut } from "@/app/auth/actions";

export default async function MissionsPage({ searchParams }: { searchParams: Promise<{ result?: string; points?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/missions");
  const { data, error } = await supabase.rpc("get_daily_missions");
  const payload = Array.isArray(data) ? data[0] : data;
  const missions = payload && typeof payload === "object" && Array.isArray(payload.missions) ? payload.missions : [];
  const messages: Record<string, string> = { claimed: `Mission complete — ${Math.max(0, Number(params.points ?? 0))} SP added.`, already_claimed: "Reward already claimed for this period.", not_eligible: "Complete the requirement before claiming.", invalid: "Unknown mission.", error: "We couldn't process the claim. Please try again." };
  const completed = missions.filter((m: { completed: boolean }) => m.completed).length;
  return <main className="spat-workspace">
    <div className="spat-workspace-glow" aria-hidden="true" />
    <section className="spat-workspace-inner">
      <header className="spat-appbar">
        <Link href="/dashboard" className="spat-app-brand"><span className="spat-brand-symbol">ϟ</span><span>SPAT<span className="spat-brand-dot">.</span><small>PARTICIPATION PROTOCOL</small></span></Link>
        <nav className="spat-app-nav" aria-label="Main navigation"><Link href="/dashboard">Overview</Link><Link className="is-current" href="/missions">Missions</Link><Link href="/daily-pulse">Daily Pulse</Link><Link href="/social-tasks">Social tasks</Link></nav>
        <form action={signOut}><button className="spat-signout" type="submit">Sign out <span>↗</span></button></form>
      </header>
      <div className="spat-page-intro">
        <div><p className="spat-eyebrow"><span /> SHOW UP · STACK POINTS</p><h1>Daily missions<span>.</span></h1><p className="spat-page-description">Small actions build momentum. Complete the requirements below to unlock your SP rewards.</p></div>
        <div className="spat-progress-card"><span className="spat-progress-label">YOUR PROGRESS</span><strong>{completed}<small> / {missions.length}</small></strong><div className="spat-progress-track"><span style={{width: `${missions.length ? Math.min(100, completed / missions.length * 100) : 0}%`}} /></div><small className="spat-progress-caption">Missions completed this period</small></div>
      </div>
      {params.result && <p className={params.result === "claimed" ? "spat-alert is-success" : "spat-alert"} role="status"><span>{params.result === "claimed" ? "✓" : "i"}</span>{messages[params.result] ?? "Mission status updated."}</p>}
      {error && <p className="spat-alert is-error" role="alert">Missions are temporarily unavailable. Please refresh to try again.</p>}
      {!error && missions.length === 0 && <div className="spat-empty"><span>✦</span><h2>No missions available yet</h2><p>Check back soon for new ways to earn SP.</p></div>}
      {!error && missions.length > 0 && <div className="spat-task-grid">{missions.map((m: {mission_key:string; title:string; description:string; reward_sp:number; completed:boolean; available:boolean}, index: number) => <article className={`spat-task-card ${m.completed ? "is-complete" : ""}`} key={m.mission_key}>
        <div className="spat-task-top"><span className="spat-task-icon">{["◷","✦","◎","↗"][index % 4]}</span><span className={`spat-status ${m.completed ? "status-complete" : m.available ? "status-ready" : "status-locked"}`}><i />{m.completed ? "COMPLETED" : m.available ? "READY TO CLAIM" : "IN PROGRESS"}</span></div>
        <h2>{m.title}</h2><p className="spat-task-description">{m.description}</p>
        <div className="spat-task-bottom"><div className="spat-reward"><span>REWARD</span><strong>+{m.reward_sp} <small>SP</small></strong></div>
          {m.completed ? <div className="spat-complete-note"><span>✓</span> Reward claimed</div> : m.available ? <form action={claimDailyMission}><input type="hidden" name="mission_key" value={m.mission_key}/><button className="spat-primary-button" type="submit">Claim reward <span>→</span></button></form> : <span className="spat-locked-note">Complete requirement to unlock</span>}
        </div>
      </article>)}</div>}
      <footer className="spat-workspace-footer"><span>SPAT <i /> BUILD YOUR MOMENTUM</span><span>Rewards are subject to server validation.</span></footer>
    </section>
  </main>;
}
