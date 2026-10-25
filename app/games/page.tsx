import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import SpatGamesClient from "@/app/games/spat-games-client";

export default async function GamesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/games");
  const [{ data: balance }, { data: submissions }] = await Promise.all([
    supabase.from("point_balances").select("gp_balance").eq("user_id", user.id).maybeSingle(),
    supabase.from("game_score_submissions").select("gp_awarded,created_at").eq("user_id", user.id).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  ]);
  const weeklyGp = (submissions ?? []).reduce((sum, item) => sum + Number(item.gp_awarded ?? 0), 0);
  return <main className="games-shell"><header className="games-topbar"><Link href="/dashboard" className="games-brand"><span>ϟ</span> SPAT<span>.</span><small>ARCADE</small></Link><nav><Link href="/dashboard">Overview</Link><Link className="current" href="/games">Games</Link><Link href="/missions">Missions</Link><Link href="/daily-pulse">Daily Pulse</Link><Link href="/social-tasks">Social tasks</Link></nav><div className="games-account"><span>{user.email}</span><form action={signOut}><button type="submit">Sign out ↗</button></form></div></header><SpatGamesClient initialGp={Number(balance?.gp_balance ?? 0)} initialWeeklyGp={weeklyGp}/><footer className="games-footer"><span>SPAT <i/> SHOW UP. STACK POINTS.</span><Link href="/dashboard">← Back to your dashboard</Link></footer></main>;
}
