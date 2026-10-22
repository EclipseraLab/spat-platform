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

  const [{ data: profile }, { data: balance }, { data: latestCheckIn }] = await Promise.all([
    supabase.from("profiles").select("username, display_name").eq("id", user.id).maybeSingle(),
    supabase.from("point_balances").select("sp_balance, gp_balance, lifetime_sp_earned").eq("user_id", user.id).maybeSingle(),
    supabase.from("check_ins").select("claimed_at").eq("user_id", user.id).order("claimed_at", { ascending: false }).limit(1).maybeSingle()
  ]);

  const username = profile?.display_name || profile?.username || user.email?.split("@")[0] || "member";
  const nextCheckIn = latestCheckIn ? new Date(new Date(latestCheckIn.claimed_at).getTime() + 24 * 60 * 60 * 1000) : null;
  const canCheckIn = !nextCheckIn || nextCheckIn.getTime() <= Date.now();
  const notice = params.checkin === "success"
    ? "Check-in successful! 3 SP have been added to your account."
    : params.checkin === "wait"
      ? "You've already checked in within the last 24 hours. Come back when your next check-in is available."
      : params.checkin === "error"
        ? "We couldn't complete your check-in. Please refresh and try again."
        : params.welcome
          ? "Welcome to SPAT. Your account and point balance are ready."
          : "";

  return <main className="auth-shell"><section className="auth-card">
    <Link href="/" className="auth-brand">ϟ SPAT<span>.</span></Link>
    <p className="auth-eyebrow">YOUR SPAT SPACE</p>
    <h1>Welcome, {username}.</h1>
    <p className="auth-copy">Your account dashboard. Points shown here are loaded from your SPAT account.</p>
    <div className="setup-status"><span /> Signed in as {user.email}</div>
    {notice && <p className="auth-copy" role="status">{notice}</p>}
    <div className="point-summary">
      <div><span>SPAT POINTS</span><strong>{balance?.sp_balance ?? 0} <small>SP</small></strong></div>
      <div><span>GAME POINTS</span><strong>{balance?.gp_balance ?? 0} <small>GP</small></strong></div>
      <p>Lifetime SP earned: {balance?.lifetime_sp_earned ?? 0} SP</p>
    </div>
    <div className="checkin-panel">
      <h2>Daily check-in</h2>
      <p>Earn 3 SP once every 24 hours. Your reward is recorded on the server.</p>
      {canCheckIn
        ? <form action={claimDailyCheckIn}><button type="submit">Check in for +3 SP →</button></form>
        : <p>Next check-in available: {nextCheckIn?.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC</p>}
    </div>
    <Link href="/" className="dashboard-link">Return to SPAT overview preview →</Link>
    <form action={signOut}><button className="secondary-button" type="submit">Sign out</button></form>
  </section></main>;
}
