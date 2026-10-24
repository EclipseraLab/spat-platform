import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { reviewSocialSubmission, saveSocialTask } from "@/app/admin/actions";

import { saveMission } from "@/app/admin/quests/actions";

type Mission = { id: string; title: string; description: string; reward_sp: number; active: boolean; created_at: string };
type Task = { id: string; title: string; description: string; reward_sp: number; active: boolean; created_at: string };
type Submission = { id: string; user_id: string; username: string | null; task_id: string; task_title: string; reward_sp: number; proof_url: string; status: string; points_awarded: number; created_at: string };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string; result?: string }> }) {
  const params = await searchParams;
  const tab = params.tab === "reviews" ? "reviews" : params.tab === "quests" ? "quests" : "tasks";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data: admin, error: adminError } = await supabase.from("spat_admins").select("role").eq("user_id", user.id).maybeSingle();
  if (adminError || !admin) redirect("/dashboard?notice=admin-only");

  const [{ data: tasks }, { data: submissions }, { data: missions }] = await Promise.all([
    supabase.from("social_tasks").select("id,title,description,reward_sp,active,created_at").order("created_at", { ascending: false }),
    supabase.rpc("spat_admin_list_submissions", { p_status: "pending" })
  ]);
  const pending: Submission[] = Array.isArray(submissions) ? submissions : [];
  const taskList: Task[] = Array.isArray(tasks) ? tasks as Task[] : [];\n  const missionList: Mission[] = Array.isArray(missions) ? missions as Mission[] : [];
  const messages: Record<string,string> = { saved: "Task saved.", approved: "Submission approved and points awarded.", rejected: "Submission rejected.", already_reviewed: "This submission was already reviewed.", invalid: "Check the submitted fields and try again.", error: "The action could not be completed. Check logs and try again." };

  return <main className="auth-shell"><section className="auth-card pulse-card" style={{width:"min(100%,900px)"}}>
    <header className="dashboard-header"><Link href="/" className="auth-brand">ϟ SPAT<span>.</span></Link><div style={{display:"flex",alignItems:"center",gap:12}}><span className="dashboard-live"><i/> ADMIN · {admin.role.toUpperCase()}</span><form action={signOut}><button className="auth-submit" type="submit">Sign out</button></form></div></header>
    <p className="auth-eyebrow">SPAT CONTROL CENTRE</p><h1>Admin panel.</h1>
    <p className="auth-copy">Manage community social tasks and review submitted proof. Approved submissions are rewarded once through the secure database action.</p>
    {params.result && <p className={["saved","approved","rejected"].includes(params.result) ? "dashboard-notice dashboard-notice--success" : "dashboard-notice dashboard-notice--error"} role="status">{messages[params.result] ?? "Action status updated."}</p>}
    <nav style={{display:"flex",gap:10,borderBottom:"1px solid #263248",paddingBottom:16,marginBottom:22}}>
      <Link className="secondary-button" style={{width:"auto",textDecoration:"none",background:tab==="tasks"?"#1b3150":"#151e2d"}} href="/admin?tab=tasks">Social task manager ({taskList.length})</Link>
      <Link className="secondary-button" style={{width:"auto",textDecoration:"none",background:tab==="reviews"?"#1b3150":"#151e2d"}} href="/admin?tab=reviews">Pending reviews ({pending.length})</Link><Link className="secondary-button" style={{width:"auto",textDecoration:"none",background:tab==="quests"?"#1b3150":"#151e2d"}} href="/admin?tab=quests">Quest manager ({missionList.length})</Link>
    </nav>
    {tab === "quests" ? <><h2 style={{fontSize:18,marginBottom:14}}>Create a quest</h2><form action={saveMission} className="auth-form" style={{border:"1px solid #263248",borderRadius:10,padding:16,marginBottom:25}}><label>Quest title<input name="title" required minLength={2} maxLength={120}/></label><label>Instructions<textarea name="description" maxLength={2000} rows={3}/></label><label>Reward (SP)<input name="reward_sp" type="number" min={0} max={10000} defaultValue={5} required/></label><label style={{display:"flex",alignItems:"center",gap:8}}><input name="active" type="checkbox" defaultChecked style={{width:16}}/> Publish quest on the site</label><button className="auth-submit" type="submit">Publish quest</button></form><h2 style={{fontSize:18,marginBottom:14}}>Existing quests</h2>{missionList.length===0 && <p className="auth-copy">No quests found.</p>}<div style={{display:"grid",gap:12}}>{missionList.map(m=><article key={m.id} className="pulse-question"><div className="pulse-question-head"><span>{m.active?"PUBLISHED":"UNPUBLISHED"}</span><span className="pulse-answered">+{m.reward_sp} SP</span></div><h2>{m.title}</h2><p className="auth-copy">{m.description}</p><details><summary style={{cursor:"pointer",color:"#9fc3ff"}}>Edit quest</summary><form action={saveMission} className="auth-form" style={{marginTop:12}}><input type="hidden" name="id" value={m.id}/><label>Title<input name="title" defaultValue={m.title} required minLength={2} maxLength={120}/></label><label>Instructions<textarea name="description" rows={3} maxLength={2000} defaultValue={m.description}/></label><label>Reward (SP)<input name="reward_sp" type="number" min={0} max={10000} defaultValue={m.reward_sp} required/></label><label style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" name="active" defaultChecked={m.active} style={{width:16}}/> Published</label><button className="auth-submit" type="submit">Save changes</button></form></details></article>)}</div></> : tab === "tasks" ? <>
      <h2 style={{fontSize:18,marginBottom:14}}>Create or update a social task</h2>
      <form action={saveSocialTask} className="auth-form" style={{border:"1px solid #263248",borderRadius:10,padding:16,marginBottom:25}}>
        <label>Task ID (lowercase, use underscores)<input name="id" required minLength={3} maxLength={40} pattern="[a-z0-9_]+" placeholder="e.g. follow_x_new" /></label>
        <label>Task title<input name="title" required minLength={2} maxLength={120} placeholder="Follow SPAT on X" /></label>
        <label>Instructions<textarea name="description" maxLength={2000} rows={3} placeholder="Explain what participants must do and what proof to submit." /></label>
        <label>Reward (SP)<input name="reward_sp" type="number" required min={1} max={10000} defaultValue={5} /></label>
        <label style={{display:"flex",alignItems:"center",gap:8}}><input name="active" type="checkbox" defaultChecked style={{width:16}}/> Publish task (visible to participants)</label>
        <button className="auth-submit" type="submit">Save task</button>
      </form>
      <h2 style={{fontSize:18,marginBottom:14}}>Existing social tasks</h2>
      {taskList.length===0 && <p className="auth-copy">No tasks found.</p>}
      <div style={{display:"grid",gap:12}}>{taskList.map(task=><article key={task.id} className="pulse-question">
        <div className="pulse-question-head"><span>{task.active?"PUBLISHED":"UNPUBLISHED"}</span><span className="pulse-answered">+{task.reward_sp} SP</span></div>
        <h2>{task.title}</h2><p className="auth-copy">{task.description}</p><p style={{fontSize:10,color:"#8291aa"}}>ID: {task.id}</p>
        <details><summary style={{cursor:"pointer",color:"#9fc3ff",fontSize:11}}>Edit this task</summary>
          <form action={saveSocialTask} className="auth-form" style={{marginTop:14}}>
            <input type="hidden" name="id" value={task.id}/>
            <label>Title<input name="title" required minLength={2} maxLength={120} defaultValue={task.title}/></label>
            <label>Instructions<textarea name="description" maxLength={2000} rows={3} defaultValue={task.description}/></label>
            <label>Reward (SP)<input name="reward_sp" type="number" required min={1} max={10000} defaultValue={task.reward_sp}/></label>
            <label style={{display:"flex",alignItems:"center",gap:8}}><input name="active" type="checkbox" defaultChecked={task.active} style={{width:16}}/> Published</label>
            <button className="auth-submit" type="submit">Update task</button>
          </form>
        </details>
      </article>)}</div>
    </> : <>
      <h2 style={{fontSize:18,marginBottom:14}}>Submissions awaiting review</h2>
      {pending.length===0 && <p className="auth-copy">No pending submissions. New requests will appear here.</p>}
      <div style={{display:"grid",gap:14}}>{pending.map(item=><article key={item.id} className="pulse-question">
        <div className="pulse-question-head"><span>PENDING</span><span className="pulse-answered">+{item.reward_sp} SP</span></div>
        <h2>{item.task_title}</h2><p className="auth-copy">Participant: {item.username ? "@"+item.username : item.user_id}</p>
        <p style={{fontSize:11,color:"#91a0b7"}}>Submitted {new Date(item.created_at).toLocaleString()}</p>
        <p><a href={item.proof_url} target="_blank" rel="noreferrer" style={{color:"#9fc3ff",overflowWrap:"anywhere"}}>Open proof link ↗</a></p>
        <form action={reviewSocialSubmission} className="auth-form">
          <input type="hidden" name="submission_id" value={item.id}/>
          <label>Review note (optional)<textarea name="review_note" maxLength={1000} rows={2} placeholder="Reason for decision or internal note"/></label>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><button className="auth-submit" name="decision" value="approved" type="submit">Approve & award {item.reward_sp} SP</button><button className="secondary-button" name="decision" value="rejected" type="submit">Reject</button></div>
        </form>
      </article>)}</div>
    </>}
    <nav className="auth-footer"><Link href="/dashboard">Dashboard</Link><span>·</span><Link href="/social-tasks">Participant social tasks</Link><span>·</span><Link href="/missions">Missions</Link></nav>
  </section></main>;
}
