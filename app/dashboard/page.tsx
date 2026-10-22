import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { claimDailyCheckIn, signOut } from "@/app/auth/actions";

type DashboardPageProps = { searchParams: Promise<{ checkin?: string; welcome?: string }> };

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile, error: profileError }, { data: balance, error: balanceError }, { data: latestCheckIn, error: checkInError }] = await Promise.all([
    supabase.from("profiles").select("username, display_name").eq("id", user.id).maybeSingle(),
    supabase.from("point_balances").select("sp_balance, gp_balance, lifetime_sp_earned").eq("user_id", user.id).maybeSingle(),
    supabase.from("check_ins").select("claimed_at").eq("user_id", user.id).order("claimed_at", { ascending: false }).limit(1).maybeSingle()
  ]);

  if (profileError) console.error("Dashboard profile query failed:", profileError.message);
  if (balanceError) console.error("Dashboard balance query failed:", balanceError.message);
  if (checkInError) console.error("Dashboard check-in query failed:", checkInError.message);

  const username = profile?.display_name || profile?.username || user.email?.split("@")[0] || "member";
  const nextCheckIn = latestCheckIn ? new Date(new Date(latestCheckIn.claimed_at).getTime() + 24 * 60 * 60 * 1000) : null;
  const canCheckIn = !nextCheckIn || nextCheckIn.getTime() <= Date.now();
  const notice = params.checkin === "success"
    ? { kind: "success", text: "Check-in successful — 3 SP have been added to your account." }
    : params.checkin === "wait"
      ? { kind: "info", text: "You've already checked in within the last 24 hours. Your next check-in time is shown below." }
      : params.checkin === "error"
        ? { kind: "error", text: "We couldn't record your check-in. Your balance has not been assumed to change. Please try again later." }
        : params.welcome
          ? { kind: "info", text: "Welcome to SPAT. Your account is ready." }
          : null;

  const spBalance = balance?.sp_balance ?? 0;
  const gpBalance = balance?.gp_balance ?? 0;
  const lifetimeSP = balance?.lifetime_sp_earned ?? 0;

  return <main className="dashboard-shell">
    <section className="dashboard-card" aria-labelledby="dashboard-title">
      <header className="dashboard-header">
        <Link href="/" className="auth-brand">ϟ SPAT<span>.</span></Link>
        <span className="dashboard-live"><i /> MEMBER SPACE</span>
      </header>

      <div className="dashboard-intro">
        <p className="auth-eyebrow">YOUR SPAT SPACE</p>
        <h1 id="dashboard-title">Welcome, {username}.</h1>
        <p className="dashboard-subtitle">Your participation, points and daily activity in one place.</p>
      </div>

      <div className="setup-status"><span /> Signed in as <strong>{user.email}</strong></div>
      {notice && <p className={`dashboard-notice dashboard-notice--${notice.kind}`} role="status">{notice.text}</p>}

      <div className="dashboard-stats" aria-label="Points balances">
        <article className="dashboard-stat dashboard-stat--sp">
          <span className="dashboard-stat-label">SPAT POINTS</span>
          <strong>{spBalance.toLocaleString("en-US")} <small>SP</small></strong>
          <span className="dashboard-stat-foot">Your participation balance</span>
        </article>
        <article className="dashboard-stat dashboard-stat--gp">
          <span className="dashboard-stat-label">GAME POINTS</span>
          <strong>{gpBalance.toLocaleString("en-US")} <small>GP</small></strong>
          <span className="dashboard-stat-foot">Earned in SPAT games</span>
        </article>
        <article className="dashboard-stat dashboard-stat--lifetime">
          <span className="dashboard-stat-label">LIFETIME EARNED</span>
          <strong>{lifetimeSP.toLocaleString("en-US")} <small>SP</small></strong>
          <span className="dashboard-stat-foot">Total SP earned to date</span>
        </article>
      </div>

      <section className="dashboard-checkin">
        <div className="checkin-copy">
          <span className="checkin-kicker">DAILY REWARD</span>
          <h2>Show up. Earn 3 SP.</h2>
          <p>Check in once every 24 hours. Your reward is recorded securely against your account.</p>
          {!canCheckIn && nextCheckIn && <p className="checkin-next">Next check-in: {nextCheckIn.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC</p>}
        </div>
        {canCheckIn
          ? <form action={claimDailyCheckIn} className="checkin-form"><button type="submit" className="checkin-button">Check in <span>+3 SP&nbsp; →</span></button></form>
          : <div className="checkin-complete">✓ Available again in 24 hours</div>}
      </section>

      <footer className="dashboard-footer">
        <Link href="/" className="dashboard-link">← Return to SPAT overview</Link>
        <form action={signOut}><button className="secondary-button" type="submit">Sign out</button></form>
      </footer>
    </section>
  </main>;
}
