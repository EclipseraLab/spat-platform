import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut, submitSocialTask, saveXProfile } from "@/app/auth/actions";

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
    submitted: "Task submitted. Your reward stays pending until a reviewer approves it.",
    profile_saved: "Your X profile is saved. You only need to do this once.",
    profile_already_saved: "Your X profile is already registered.",
    profile_required: "Register your X profile before participating in social tasks.",
    invalid_profile: "Enter a valid X profile URL, such as https://x.com/yourhandle.",
    profile_save_error: "We could not save your X profile. Please try again.",
    already_submitted: "You've already submitted proof for this task.",
    invalid_url: "Enter a valid public URL beginning with https:// or http://.",
    invalid_task: "That task is not available.",
    error: "We couldn't submit your proof. Please try again."
  };
  const pending = tasks.filter(task => task.submission_status === "pending").length;
  const approved = tasks.filter(task => task.submission_status === "approved").length;
  const xProfileUrl = typeof user.user_metadata?.x_profile_url === "string" ? user.user_metadata.x_profile_url : "";
  return (
    <main className="spat-workspace">
      <style>{`
      .spat-x-profile-card{display:grid;grid-template-columns:1.1fr 1fr;gap:28px;align-items:center;border:1px solid #263d5b;border-radius:16px;padding:26px;background:radial-gradient(ellipse at 100% 0%,#1b3654 0,transparent 56%),linear-gradient(135deg,#111d2d,#0b111b);margin:20px 0 25px;box-shadow:0 15px 45px #0002}
      .spat-x-profile-card h2{font-size:22px;letter-spacing:-.5px;margin:10px 0}.spat-x-profile-card h2 span{color:#77a9ff}.spat-x-profile-card p:not(.spat-eyebrow){font-size:12px;color:#91a3bc;line-height:1.7;margin:0;max-width:450px}
      .spat-x-profile-form{display:grid;gap:10px}.spat-x-profile-form label{font:10px monospace;letter-spacing:1px;color:#94a9c7}.spat-x-profile-form input{width:100%;min-width:0;border:1px solid #2a4261;border-radius:9px;padding:13px;background:#080f19;color:#edf4ff;font:12px inherit}.spat-x-profile-form input:focus{outline:2px solid #4e8cff;outline-offset:2px}
      .spat-x-profile-saved{display:flex;align-items:center;gap:12px;border:1px solid #214b40;background:linear-gradient(100deg,#102a26,#0d171d);border-radius:12px;padding:14px 17px;margin:20px 0 24px}.spat-x-profile-saved>span:first-child{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:#1a4437;color:#7de0b0}.spat-x-profile-saved div{min-width:0;display:grid;gap:4px}.spat-x-profile-saved strong{font-size:12px;color:#dff9eb}.spat-x-profile-saved small{font-size:11px;color:#88b9a5;overflow-wrap:anywhere}.spat-profile-lock{margin-left:auto;color:#7fdcb0;font:10px monospace;letter-spacing:1px}
      .spat-task-card{transition:transform .18s,border-color .18s,box-shadow .18s}.spat-task-card:hover{transform:translateY(-3px);border-color:#385b86;box-shadow:0 15px 35px #0003}
      @media(max-width:680px){.spat-x-profile-card{grid-template-columns:1fr;padding:19px;gap:18px}}
      `}</style>
      <div className="spat-workspace-glow" aria-hidden="true" />
      <section className="spat-workspace-inner">
        <header className="spat-appbar">
          <Link href="/dashboard" className="spat-app-brand"><span className="spat-brand-symbol">ϟ</span><span>SPAT<span className="spat-brand-dot">.</span><small>PARTICIPATION PROTOCOL</small></span></Link>
          <nav className="spat-app-nav" aria-label="Main navigation"><Link href="/dashboard">Overview</Link><Link href="/missions">Missions</Link><Link href="/daily-pulse">Daily Pulse</Link><Link className="is-current" href="/social-tasks">Social tasks</Link></nav>
          <form action={signOut}><button className="spat-signout" type="submit">Sign out <span>↗</span></button></form>
        </header>
        <div className="spat-page-intro">
          <div><p className="spat-eyebrow"><span /> GROW THE COMMUNITY</p><h1>Social tasks<span>.</span></h1><p className="spat-page-description">Complete community campaigns, track your task status, and earn SP when approved.</p></div>
          <div className="spat-social-summary"><div><span className="summary-icon">◷</span><span><small>IN REVIEW</small><strong>{pending}</strong></span></div><div><span className="summary-icon summary-icon-green">✓</span><span><small>APPROVED</small><strong>{approved}</strong></span></div></div>
        </div>
        <div className="spat-review-note"><span>ⓘ</span><p><strong>Participation profile</strong> Register your X profile once. We only ask for a tweet URL when a campaign specifically requires a tweet.</p></div>
        {!xProfileUrl ? <section className="spat-x-profile-card"><div><p className="spat-eyebrow"><span /> ONE-TIME SETUP</p><h2>Connect your X identity<span>.</span></h2><p>Submit your public X profile before joining social campaigns. You will not need to submit it again.</p></div><form action={saveXProfile} className="spat-x-profile-form"><label htmlFor="x-profile-url">X PROFILE URL</label><input id="x-profile-url" name="x_profile_url" type="url" required placeholder="https://x.com/yourhandle" autoComplete="url" /><button className="spat-primary-button" type="submit">Save X profile <span>→</span></button></form></section> : <div className="spat-x-profile-saved"><span>✓</span><div><strong>X profile registered</strong><small>{xProfileUrl}</small></div><span className="spat-profile-lock">SAVED</span></div>}
        {params.result && <p className={params.result === "submitted" ? "spat-alert is-success" : "spat-alert"} role="status"><span>{params.result === "submitted" ? "✓" : "i"}</span>{messages[params.result] ?? "Submission status updated."}</p>}
        {error && <p className="spat-alert is-error" role="alert">Social tasks are temporarily unavailable. Please refresh to try again.</p>}
        {!error && xProfileUrl && tasks.length === 0 && <div className="spat-empty"><span>✦</span><h2>No social tasks available yet</h2><p>New community tasks will appear here when they are published.</p></div>}
        {!error && xProfileUrl && tasks.length > 0 && <div className="spat-task-grid">{tasks.map((task, index) => <article className={`spat-task-card ${task.submission_status === "approved" ? "is-complete" : ""}`} key={task.id}>
          <div className="spat-task-top"><span className="spat-task-icon">{["↗","◎","✦","◉"][index % 4]}</span><span className={`spat-status ${task.submission_status === "approved" ? "status-complete" : task.submission_status === "pending" ? "status-pending" : task.submission_status === "rejected" ? "status-rejected" : "status-ready"}`}><i />{task.submission_status ? task.submission_status.replace("_", " ").toUpperCase() : "AVAILABLE"}</span></div>
          <h2>{task.title}</h2><p className="spat-task-description">{task.description}</p>
          <div className="spat-task-bottom"><div className="spat-reward"><span>REWARD</span><strong>+{task.reward_sp} <small>SP</small></strong></div>
            {task.submission_status === "pending" ? <div className="spat-state-message"><strong>Proof received</strong><small>Waiting for a moderator to review.</small></div>
            : task.submission_status === "approved" ? <div className="spat-complete-note"><span>✓</span> Approved</div>
            : task.submission_status === "rejected" ? <div className="spat-state-message"><strong>Needs attention</strong><small>Contact a moderator if you need help.</small></div>
            : task.id.startsWith("tweet_") ? <form action={submitSocialTask} className="spat-proof-form"><input type="hidden" name="task_id" value={task.id}/><label htmlFor={`proof-${task.id}`}>TWEET URL REQUIRED</label><input id={`proof-${task.id}`} type="url" name="proof_url" required minLength={8} maxLength={2048} placeholder="https://x.com/yourhandle/status/..." /><button className="spat-primary-button" type="submit">Submit tweet <span>→</span></button></form> : <form action={submitSocialTask} className="spat-proof-form"><input type="hidden" name="task_id" value={task.id}/><button className="spat-primary-button" type="submit">Complete task <span>→</span></button></form>}
          </div>
        </article>)}</div>}
        <footer className="spat-workspace-footer"><span>SPAT <i /> BUILD YOUR MOMENTUM</span><span>Only submit genuine, publicly accessible proof.</span></footer>
      </section>
    </main>
  );
}
