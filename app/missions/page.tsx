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
  return <main className="auth-shell"><section className="auth-card pulse-card">
    <header className="dashboard-header"><Link href="/" className="auth-brand">ϟ SPAT<span>.</span></Link><form action={signOut}><button className="auth-submit" type="submit">Sign out</button></form></header>
    <p className="auth-eyebrow">SHOW UP · STACK POINTS</p><h1>Daily missions.</h1>
    <p className="auth-copy">Complete activity in SPAT to unlock bonus SP. Rewards are validated on the server and can only be claimed once per period.</p>
    {params.result && <p className={params.result === "claimed" ? "pulse-feedback success" : "pulse-feedback notice"} role="status">{messages[params.result] ?? "Mission status updated."}</p>}
    {error && <p className="auth-error">Missions are temporarily unavailable. Please refresh to try again.</p>}
    {!error && missions.length === 0 && <p className="auth-copy">No missions are available right now.</p>}
    {missions.map((m: {mission_key:string; title:string; description:string; reward_sp:number; completed:boolean; available:boolean}) => <article className="pulse-question" key={m.mission_key}>
      <div className="pulse-question-head"><span>{m.completed ? "COMPLETED" : m.available ? "READY TO CLAIM" : "IN PROGRESS"}</span><span className="pulse-answered">+{m.reward_sp} SP</span></div>
      <h2>{m.title}</h2><p className="auth-copy">{m.description}</p>
      {m.completed ? <p className="pulse-locked">Reward claimed for this period.</p> : m.available ? <form action={claimDailyMission}><input type="hidden" name="mission_key" value={m.mission_key}/><button className="auth-submit" type="submit">Claim {m.reward_sp} SP</button></form> : <p className="pulse-locked">Complete the requirement to unlock this reward.</p>}
    </article>)}
    <nav className="auth-footer"><Link href="/dashboard">Dashboard</Link><span>·</span><Link href="/daily-pulse">Daily Pulse</Link></nav>
  </section></main>;
}
