import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const username = String(user.user_metadata?.username ?? user.email?.split("@")[0] ?? "member");
  return <main className="auth-shell"><section className="auth-card">
    <Link href="/" className="auth-brand">ϟ SPAT<span>.</span></Link>
    <p className="auth-eyebrow">YOUR SPAT SPACE</p><h1>Welcome, {username}.</h1>
    <p className="auth-copy">You're signed in. Points and activity rewards will appear here after the database schema and reward engine are connected.</p>
    <div className="setup-status"><span /> Authentication session active</div>
    <Link href="/" className="dashboard-link">Open dashboard preview →</Link>
    <form action={signOut}><button className="secondary-button" type="submit">Sign out</button></form>
  </section></main>;
}
