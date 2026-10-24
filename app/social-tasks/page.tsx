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
  const pending = tasks.filter(task => task.submission_status === "pending").length;
  const approved = tasks.filter(task => task.submission_status === "approved").length;
  return <main className="spat-workspace">
    <div className="spat-workspace-glow" aria-hidden="true" />
    <section className="spat-workspace-inner">
      <header className="spat-appbar">
        <Link href="/" className="spat-app-brand"><span className="spat-brand-symbol">ϟ</span><span>SPAT<span className="spat-brand-dot">.</span><small>PARTICIPATION PROTOCOL</small></span></Link>
        <nav className="spat-app-nav" aria-label="Main navigation"><Link href="/dashboard">Overview</Link><Link href="/missions">Missions</Link><Link href="/daily-pulse">Daily Pulse</Link><Link className="is-current" href="/social-tasks">Social tasks</Link></nav>
        <form action={signOut}><button className="spat-signout" type="submit">Sign out <span>↗</span></button></form>
      </header>
      <div className="spat-page-intro">
        <div><p className="spat-eyebrow"><span /> GROW THE COMMUNITY</p><h1>Social tasks<span>.</span></h1><p className="spat-page-description">Support the SPAT community, share proof of your activity, and earn points when your submission is approved.</p></div>
        <div className="spat-social-summary"><div><span className="summary-icon">◷</span><span><small>IN REVIEW</small><strong>{pending}</strong></span></div><div><span className="summary-icon summary-icon-green">✓</span><span><small>APPROVED</small><strong>{approved}</strong></span></div></div>
      </div>
      <div className="spat-review-note"><span>ⓘ</span><p><strong>How rewards work</strong> Submit a public proof link for each task. Points are only awarded after a review is approved.</p></div>
      {params.result && <p className={params.result === "submitted" ? "spat-alert is-success" : "spat-alert"} role="status"><span>{params.result === "submitted" ? "✓" : "i"}</span>{messages[params.result] ?? "Submission status updated."}</p>}
      {error && <p className="spat-alert is-error" role="alert">Social tasks are temporarily unavailable. Please refresh to try again.</p>}
      {!error && tasks.length === 0 && <div className="spat-empty"><span>✦</span><h2>No social tasks available yet</h2><p>New community tasks will appear here when they are published.</p></div>}
      {!error && tasks.length > 0 && <div className="spat-task-grid">{tasks.map((task, index) => <article className={`spat-task-card ${task.submission_status === "approved" ? "is-complete" : ""}`} key={task.id}>
        <div className="spat-task-top"><span className="spat-task-icon">{["↗","◎","✦","◉"][index % 4]}</span><span className={`spat-status ${task.submission_status === "approved" ? "status-complete" : task.submission_status === "pending" ? "status-pending" : task.submission_status === "rejected" ? "status-rejected" : "status-ready"}`}><i />{task.submission_status ? task.submission_status.replace("_", " ").toUpperCase() : "AVAILABLE"}</span></div>
        <h2>{task.title}</h2><p className="spat-task-description">{task.description}</p>
        <div className="spat-task-bottom"><div className="spat-reward"><span>REWARD</span><strong>+{task.reward_sp} <small>SP</small></strong></div>
          {task.submission_status === "pending" ? <div className="spat-state-message"><strong>Proof received</strong><small>Waiting for a moderator to review.</small></div>
          : task.submission_status === "approved" ? <div className="spat-complete-note"><span>✓</span> Approved</div>
          : task.submission_status === "rejected" ? <div className="spat-state-message"><strong>Needs attention</strong><small>Contact a moderator if you need help.</small></div>
          : <form action={submitSocialTask} className="spat-proof-form"><input type="hidden" name="task_id" value={task.id}/><label htmlFor={`proof-${task.id}`}>PUBLIC PROOF LINK</label><input id={`proof-${task.id}`} type="url" name="proof_url" required minLength={8} maxLength={2048} placeholder="https://x.com/your-post" /><button className="spat-primary-button" type="submit">Submit for review <span>→</span></button></form>}
        </div>
      </article>)}</div>}
      <footer className="spat-workspace-footer"><span>SPAT <i /> BUILD YOUR MOMENTUM</span><span>Only submit genuine, publicly accessible proof.</span></footer>
    </section>
  </main>;
}
