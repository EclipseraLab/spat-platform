import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut, submitSocialTask } from "@/app/auth/actions";

type SocialTask = { id: string; title: string; description: string; reward_sp: number; submission_status: "pending" | "approved" | "rejected" | null; submitted_at: string | null };

export default async function SocialTasksPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/social-tasks");
  const { data, error } = await supabase.rpc("get_social_tasks");
  const payload = Array.isArray(data) ? data[0] : data;
  const tasks: SocialTask[] = payload && Array.isArray(payload.tasks) ? payload.tasks : [];
  const messages: Record<string, string> = {
    submitted: "Proof submitted. Your reward stays pending until a reviewer approves it.",
    already_submitted: "You've already submitted proof for this task.",
    invalid_url: "Enter a valid public URL beginning with https:// or http://.",
    invalid_task: "That task is not available.",
    error: "We couldn't submit your proof. Please try again."
  };
  return <main className="auth-shell"><section className="auth-card pulse-card">
    <header className="dashboard-header"><Link href="/" className="auth-brand">ϟ SPAT<span>.</span></Link><form action={signOut}><button className="auth-submit" type="submit">Sign out</button></form></header>
    <p className="auth-eyebrow">GROW THE COMMUNITY</p><h1>Social tasks.</h1>
    <p className="auth-copy">Complete a community task and submit a public proof link. Rewards are not added until a submission is reviewed and approved.</p>
    {params.result && <p className={params.result === "submitted" ? "pulse-feedback success" : "pulse-feedback notice"} role="status">{messages[params.result] ?? "Submission status updated."}</p>}
    {error && <p className="auth-error">Social tasks are temporarily unavailable. Please refresh to try again.</p>}
    {!error && tasks.length === 0 && <p className="auth-copy">No social tasks are available right now.</p>}
    {tasks.map(task => <article className="pulse-question" key={task.id}>
      <div className="pulse-question-head"><span>{task.submission_status ? task.submission_status.toUpperCase().replace("_", " ") : "AVAILABLE"}</span><span className="pulse-answered">+{task.reward_sp} SP</span></div>
      <h2>{task.title}</h2><p className="auth-copy">{task.description}</p>
      {task.submission_status === "pending" ? <p className="pulse-locked">Proof received — waiting for review.</p>
        : task.submission_status === "approved" ? <p className="pulse-feedback success">Approved. Your reward has been reviewed.</p>
        : task.submission_status === "rejected" ? <p className="pulse-locked">This submission was rejected. Contact a moderator for help.</p>
        : <form action={submitSocialTask} className="auth-form">
          <input type="hidden" name="task_id" value={task.id}/>
          <label>Public proof URL<input type="url" name="proof_url" required minLength={8} maxLength={2048} placeholder="https://..." /></label>
          <button className="auth-submit" type="submit">Submit for review</button>
        </form>}
    </article>)}
    <nav className="auth-footer"><Link href="/dashboard">Dashboard</Link><span>·</span><Link href="/missions">Daily Missions</Link><span>·</span><Link href="/daily-pulse">Daily Pulse</Link></nav>
  </section></main>;
}
