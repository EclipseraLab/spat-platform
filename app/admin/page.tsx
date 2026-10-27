import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { reviewSocialSubmission, saveSocialTask, deleteSocialTask } from "@/app/admin/actions";
import { saveMission, deleteMission } from "@/app/admin/quests/actions";

type Mission = { id: string; title: string; description: string; reward_sp: number; active: boolean; created_at: string };
type Task = { id: string; title: string; description: string; reward_sp: number; active: boolean; created_at: string };
type Submission = { id: string; user_id: string; username: string | null; task_id: string; task_title: string; reward_sp: number; proof_url: string; status: string; points_awarded: number; created_at: string };

const panel: React.CSSProperties = { minHeight: "100vh", background: "radial-gradient(ellipse at 70% -10%, #163c54 0%, transparent 42%), #070b12", color: "#e8eef8", fontFamily: "Arial, sans-serif" };
const card: React.CSSProperties = { border: "1px solid #243246", background: "linear-gradient(145deg,#111b29,#0b111b)", borderRadius: 15, padding: 20 };
const field: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #2a3b50", borderRadius: 8, padding: "12px 13px", background: "#080f19", color: "#edf4ff", fontSize: 13 };
const label: React.CSSProperties = { display: "grid", gap: 7, color: "#aab8ca", fontSize: 12 };
const primary: React.CSSProperties = { border: "1px solid #4e9dff", borderRadius: 8, background: "linear-gradient(110deg,#4e9dff,#2469d8)", color: "#fff", padding: "12px 15px", fontWeight: 700, fontSize: 12, cursor: "pointer" };
const muted: React.CSSProperties = { color: "#8797ad", fontSize: 12, lineHeight: 1.65 };
const chip = (active: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 7, border: `1px solid ${active ? "#245943" : "#354052"}`, background: active ? "#10291f" : "#1a202b", color: active ? "#8de0b4" : "#9aa8bc", borderRadius: 20, padding: "6px 9px", font: "10px monospace", letterSpacing: ".4px" });

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
    supabase.rpc("spat_admin_list_submissions", { p_status: "pending" }),
    supabase.from("missions").select("id,title,description,reward_sp,active,created_at").order("created_at", { ascending: false })
  ]);
  const pending: Submission[] = Array.isArray(submissions) ? submissions : [];
  const taskList: Task[] = Array.isArray(tasks) ? tasks as Task[] : [];
  const missionList: Mission[] = Array.isArray(missions) ? missions as Mission[] : [];
  const messages: Record<string,string> = { saved: "Changes saved successfully.", approved: "Submission approved and SP awarded.", rejected: "Submission rejected.", already_reviewed: "This submission was already reviewed.", invalid: "Please check the submitted fields.", error: "The action could not be completed. Please try again." };
  const tabs = [
    { id: "tasks", label: "Social tasks", count: taskList.length, icon: "↗" },
    { id: "quests", label: "Quest studio", count: missionList.length, icon: "✳" },
    { id: "reviews", label: "Proof reviews", count: pending.length, icon: "✓" }
  ];

  return <main style={panel}>
    <style>{`
      *{box-sizing:border-box} input,textarea,button{font:inherit} input:focus,textarea:focus{outline:2px solid #4b91ef;outline-offset:1px}
      .spat-admin-layout{display:grid;grid-template-columns:235px minmax(0,1fr);min-height:100vh}
      .spat-admin-side{padding:25px 15px;border-right:1px solid #1b2939;background:#080e17;display:flex;flex-direction:column;gap:25px}
      .spat-admin-brand{display:flex;align-items:center;gap:11px;text-decoration:none;color:#f4f8ff;padding:0 9px;font-weight:800;letter-spacing:1.5px;font-size:21px}
      .spat-admin-mark{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:linear-gradient(145deg,#6bd8b2,#2189b8);color:#06131c;box-shadow:0 6px 24px #22a7b644}
      .spat-admin-kicker{font:10px monospace;letter-spacing:1.5px;color:#72849b;padding:0 10px}
      .spat-admin-nav{display:grid;gap:7px}
      .spat-admin-nav a{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 11px;border:1px solid transparent;border-radius:9px;text-decoration:none;color:#91a2b8;font-size:12px}
      .spat-admin-nav a[aria-current=page]{color:#dff4ff;background:linear-gradient(90deg,#17364a,#111e2d);border-color:#28516a;box-shadow:inset 2px 0 #60d6bb}
      .spat-admin-nav small{font:10px monospace;color:#9ab5ca;background:#1b2c3d;padding:4px 6px;border-radius:5px}
      .spat-admin-sidebottom{margin-top:auto;border:1px solid #203747;border-radius:12px;padding:14px;background:radial-gradient(ellipse at 100% 0,#163a48,transparent 75%),#0d1721}
      .spat-admin-main{min-width:0}
      .spat-admin-top{height:70px;display:flex;align-items:center;justify-content:space-between;gap:15px;padding:0 32px;border-bottom:1px solid #1b2939;background:#080e17cc;position:sticky;top:0;z-index:5;backdrop-filter:blur(16px)}
      .spat-admin-content{max-width:1400px;margin:0 auto;padding:30px 32px 45px}
      .spat-admin-title{font-size:clamp(27px,3vw,37px);letter-spacing:-1px;margin:8px 0;font-weight:750}
      .spat-admin-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin:24px 0}
      .spat-admin-stat{border:1px solid #243246;border-radius:12px;padding:16px;background:linear-gradient(140deg,#121d2c,#0b111a)}
      .spat-admin-stat small{display:block;color:#8294aa;font:10px monospace;letter-spacing:.7px}
      .spat-admin-stat strong{display:block;font-size:28px;margin:10px 0 5px;letter-spacing:-.7px}
      .spat-admin-stat span{color:#8b9db3;font-size:11px}
      .spat-admin-tabbar{display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid #253246;padding-bottom:17px;margin:25px 0}
      .spat-admin-tabbar a{display:flex;align-items:center;gap:9px;border:1px solid #28384d;background:#101927;color:#a7b7cb;border-radius:9px;padding:11px 13px;text-decoration:none;font-size:12px}
      .spat-admin-tabbar a[aria-current=page]{border-color:#347c8b;background:linear-gradient(110deg,#163b48,#132537);color:#e3fff9}
      .spat-admin-tabbar small{font:10px monospace;color:#8da4bc}
      .spat-admin-form{display:grid;gap:14px}
      .spat-admin-form label{display:grid;gap:7px;color:#aab8ca;font-size:12px}
      .spat-admin-form input:not([type=checkbox]),.spat-admin-form textarea{width:100%;border:1px solid #2a3b50;border-radius:8px;padding:12px 13px;background:#080f19;color:#edf4ff;font-size:13px}
      .spat-admin-form textarea{resize:vertical;min-height:90px}
      .spat-admin-check{display:flex!important;align-items:center;gap:9px!important}
      .spat-admin-check input{accent-color:#5ed5b7;width:15px;height:15px}
      .spat-admin-record{border:1px solid #26364a;background:linear-gradient(145deg,#111b29,#0b111b);border-radius:13px;padding:18px}
      .spat-admin-record h3{margin:12px 0 7px;font-size:16px}
      .spat-admin-record p{color:#8d9db2;font-size:12px;line-height:1.65}
      .spat-admin-record summary{cursor:pointer;color:#8ed7e6;font-size:12px}
      .spat-admin-action{border:1px solid #33465d;background:#172537;color:#c5d8ed;border-radius:8px;padding:11px 13px;font-size:12px;cursor:pointer}
      .spat-admin-footer{display:flex;gap:15px;flex-wrap:wrap;margin-top:30px;padding-top:18px;border-top:1px solid #1d2a3b}
      .spat-admin-footer a{color:#8198b4;font-size:11px;text-decoration:none}
      @media(max-width:850px){.spat-admin-layout{grid-template-columns:1fr}.spat-admin-side{position:static;min-height:0;border-right:0;border-bottom:1px solid #1b2939;padding:16px;gap:14px}.spat-admin-brand{padding:0}.spat-admin-kicker{display:none}.spat-admin-nav{display:flex;overflow-x:auto}.spat-admin-nav a{white-space:nowrap}.spat-admin-sidebottom{display:none}.spat-admin-top{height:60px;padding:0 18px}.spat-admin-content{padding:24px 18px}.spat-admin-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:560px){.spat-admin-grid{grid-template-columns:1fr}.spat-admin-content{padding:20px 13px}.spat-admin-top{padding:0 13px}.spat-admin-stat{padding:13px}.spat-admin-stat strong{font-size:24px}.spat-admin-tabbar a{flex:1;justify-content:center}.spat-admin-tabbar{gap:6px}}
    `}</style>
    <div className="spat-admin-layout">
      <aside className="spat-admin-side">
        <Link href="/admin" className="spat-admin-brand"><span className="spat-admin-mark">ϟ</span><span>SPAT<small style={{display:"block",fontSize:8,color:"#8295aa",letterSpacing:2,marginTop:5}}>PROTOCOL CONSOLE</small></span></Link>
        <div><p className="spat-admin-kicker">WORKSPACE</p><nav className="spat-admin-nav">{tabs.map(t=><Link key={t.id} href={"/admin?tab="+t.id} aria-current={tab===t.id?"page":undefined}><span>{t.icon} &nbsp; {t.label}</span><small>{t.count}</small></Link>)}</nav></div>
        <div className="spat-admin-sidebottom"><span style={{color:"#72d8c1",font:"10px monospace",letterSpacing:1}}>● CONTROL ACCESS</span><p style={{fontSize:13,fontWeight:700,margin:"11px 0 6px"}}>Admin workspace</p><p style={{...muted,fontSize:11,margin:0}}>Changes are protected by server-side role checks.</p></div>
        <div style={{borderTop:"1px solid #1b2939",padding:"15px 9px 0",display:"flex",justifyContent:"space-between",gap:8,color:"#74859b",fontSize:10}}><span>SPAT ADMIN</span><span>v1.0</span></div>
      </aside>
      <section className="spat-admin-main">
        <header className="spat-admin-top"><div style={{fontSize:11,color:"#8496ad"}}>SPAT <span style={{color:"#4f647c"}}>/</span> <strong style={{color:"#e1ebf8"}}>{tab==="tasks"?"SOCIAL TASKS":tab==="quests"?"QUEST STUDIO":"PROOF REVIEWS"}</strong></div><div style={{display:"flex",alignItems:"center",gap:12}}><span style={chip(true)}>● SYSTEM ONLINE</span><form action={signOut}><button className="spat-admin-action" type="submit">Sign out ↗</button></form></div></header>
        <div className="spat-admin-content">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:18,flexWrap:"wrap"}}>
            <div><p style={{font:"10px monospace",letterSpacing:1.7,color:"#66d6bd",margin:"0 0 9px"}}>◈ PROTOCOL OPERATIONS</p><h1 className="spat-admin-title">{tab==="tasks"?"Social task manager":tab==="quests"?"Quest studio":"Submission review"}</h1><p style={{...muted,maxWidth:650,marginBottom:0}}>{tab==="tasks"?"Create and maintain social quests, set SP rewards, and control what participants can see.":tab==="quests"?"Build the quest experience: publish new quests, tune rewards, and update live instructions.":"Review participant proof, open submitted links, and approve or reject requests with a clear audit trail."}</p></div>
            <div style={chip(true)}>ROLE: {String(admin.role).toUpperCase()}</div>
          </div>
          <div className="spat-admin-grid">
            <article className="spat-admin-stat"><small>ACTIVE SOCIAL TASKS</small><strong>{taskList.filter(t=>t.active).length}</strong><span>of {taskList.length} configured</span></article>
            <article className="spat-admin-stat"><small>PUBLISHED QUESTS</small><strong>{missionList.filter(m=>m.active).length}</strong><span>of {missionList.length} configured</span></article>
            <article className="spat-admin-stat"><small>AWAITING REVIEW</small><strong>{pending.length}</strong><span>participant submissions</span></article>
          </div>
          {params.result && <p role="status" style={{border:"1px solid "+(["saved","approved","rejected"].includes(params.result)?"#245b45":"#633b4a"),background:["saved","approved","rejected"].includes(params.result)?"#10271f":"#2a1721",color:["saved","approved","rejected"].includes(params.result)?"#9be0bd":"#ffc0ce",padding:"12px 14px",borderRadius:9,fontSize:12}}>{messages[params.result] ?? "Action status updated."}</p>}
          <nav className="spat-admin-tabbar">{tabs.map(t=><Link key={t.id} href={"/admin?tab="+t.id} aria-current={tab===t.id?"page":undefined}>{t.icon} {t.label}<small>{t.count}</small></Link>)}</nav>

          {tab === "quests" ? <div style={{display:"grid",gridTemplateColumns:"minmax(0,0.85fr) minmax(0,1.15fr)",gap:17,alignItems:"start"}}>
            <section style={card}><p style={{font:"10px monospace",color:"#65d6bd",letterSpacing:1.3}}>01 / CREATE</p><h2 style={{fontSize:19,margin:"8px 0"}}>Create a quest</h2><p style={muted}>Publish a new quest to the participant experience.</p><form action={saveMission} className="spat-admin-form"><label>Quest title<input name="title" required minLength={2} maxLength={120} placeholder="e.g. Explore the SPAT ecosystem" /></label><label>Instructions<textarea name="description" maxLength={2000} placeholder="Tell participants what to do and how to complete it." /></label><label>Reward (SP)<input name="reward_sp" type="number" min={0} max={10000} defaultValue={5} required /></label><label className="spat-admin-check"><input name="active" type="checkbox" defaultChecked /> Publish immediately</label><button style={primary} type="submit">Create and publish quest ↗</button></form></section>
            <section><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:13}}><h2 style={{fontSize:17,margin:0}}>Quest inventory</h2><span style={chip(true)}>{missionList.length} TOTAL</span></div>{missionList.length===0&&<div style={card}><p style={muted}>No quests found yet. Create your first quest using the form.</p></div>}<div style={{display:"grid",gap:11}}>{missionList.map(m=><article key={m.id} className="spat-admin-record"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}><span style={chip(m.active)}>{m.active?"● PUBLISHED":"○ UNPUBLISHED"}</span><span style={{font:"11px monospace",color:"#9dc5ff"}}>+{m.reward_sp} SP</span></div><h3>{m.title}</h3><p>{m.description || "No instructions provided."}</p><details><summary>Edit quest details</summary><form action={saveMission} className="spat-admin-form" style={{marginTop:14}}><input type="hidden" name="id" value={m.id}/><label>Title<input name="title" defaultValue={m.title} required minLength={2} maxLength={120}/></label><label>Instructions<textarea name="description" rows={3} maxLength={2000} defaultValue={m.description}/></label><label>Reward (SP)<input name="reward_sp" type="number" min={0} max={10000} defaultValue={m.reward_sp} required/></label><label className="spat-admin-check"><input type="checkbox" name="active" defaultChecked={m.active}/> Published on site</label><button style={primary} type="submit">Save quest changes</button></form></details></article>)}</div></section>
          </div> : tab === "tasks" ? <div style={{display:"grid",gridTemplateColumns:"minmax(0,.85fr) minmax(0,1.15fr)",gap:17,alignItems:"start"}}>
            <section style={card}><p style={{font:"10px monospace",color:"#65d6bd",letterSpacing:1.3}}>01 / CONFIGURE</p><h2 style={{fontSize:19,margin:"8px 0"}}>Add social task</h2><p style={muted}>Configure task instructions, reward points, and visibility.</p><form action={saveSocialTask} className="spat-admin-form"><label>Task ID<input name="id" required minLength={3} maxLength={40} pattern="[a-z0-9_]+" placeholder="follow_x_new" /></label><label>Task title<input name="title" required minLength={2} maxLength={120} placeholder="Follow SPAT on X" /></label><label>Instructions<textarea name="description" maxLength={2000} placeholder="Explain the task and required proof." /></label><label>Reward (SP)<input name="reward_sp" type="number" required min={1} max={10000} defaultValue={5}/></label><label className="spat-admin-check"><input name="active" type="checkbox" defaultChecked/> Publish to participants</label><button style={primary} type="submit">Save social task ↗</button></form></section>
            <section><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:13}}><h2 style={{fontSize:17,margin:0}}>Task inventory</h2><span style={chip(true)}>{taskList.length} TOTAL</span></div>{taskList.length===0&&<div style={card}><p style={muted}>No social tasks found.</p></div>}<div style={{display:"grid",gap:11}}>{taskList.map(task=><article key={task.id} className="spat-admin-record"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}><span style={chip(task.active)}>{task.active?"● PUBLISHED":"○ UNPUBLISHED"}</span><span style={{font:"11px monospace",color:"#9dc5ff"}}>+{task.reward_sp} SP</span></div><h3>{task.title}</h3><p>{task.description || "No instructions provided."}</p><p style={{font:"10px monospace",color:"#647990"}}>ID: {task.id}</p><details><summary>Edit task</summary><form action={saveSocialTask} className="spat-admin-form" style={{marginTop:14}}><input type="hidden" name="id" value={task.id}/><label>Title<input name="title" required minLength={2} maxLength={120} defaultValue={task.title}/></label><label>Instructions<textarea name="description" rows={3} maxLength={2000} defaultValue={task.description}/></label><label>Reward (SP)<input name="reward_sp" type="number" required min={1} max={10000} defaultValue={task.reward_sp}/></label><label className="spat-admin-check"><input name="active" type="checkbox" defaultChecked={task.active}/> Published</label><button style={primary} type="submit">Update task</button></form></details></article>)}</div></section>
          </div> : <section><div style={{...card,marginBottom:15}}><h2 style={{fontSize:19,margin:"0 0 7px"}}>Pending participant submissions</h2><p style={{...muted,margin:0}}>Verify the proof link before awarding SP. Each submission can only be reviewed once.</p></div>{pending.length===0&&<div style={card}><p style={muted}>Queue clear. New submissions will appear here when participants submit proof.</p></div>}<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,330px),1fr))",gap:13}}>{pending.map(item=><article key={item.id} className="spat-admin-record"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}><span style={chip(false)}>◷ PENDING</span><span style={{font:"11px monospace",color:"#9dc5ff"}}>+{item.reward_sp} SP</span></div><h3>{item.task_title}</h3><p>Participant: <strong style={{color:"#d8e5f4"}}>{item.username?"@"+item.username:item.user_id}</strong></p><p style={{fontSize:10}}>Submitted {new Date(item.created_at).toLocaleString()}</p><p><a href={item.proof_url} target="_blank" rel="noreferrer" style={{color:"#81d8e8",fontSize:12,overflowWrap:"anywhere"}}>Open proof link ↗</a></p><form action={reviewSocialSubmission} className="spat-admin-form"><input type="hidden" name="submission_id" value={item.id}/><label>Review note (optional)<textarea name="review_note" maxLength={1000} rows={2} placeholder="Add a reason or internal note."/></label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button style={primary} name="decision" value="approved" type="submit">✓ Approve +{item.reward_sp} SP</button><button className="spat-admin-action" name="decision" value="rejected" type="submit">Reject proof</button></div></form></article>)}</div></section>}
          <footer className="spat-admin-footer"><Link href="/dashboard">Member dashboard ↗</Link><Link href="/social-tasks">Participant social tasks ↗</Link><Link href="/missions">Missions page ↗</Link><span style={{marginLeft:"auto",color:"#5e7188",font:"10px monospace"}}>SPAT PROTOCOL · ADMIN CONSOLE</span></footer>
        </div>
      </section>
    </div>
  </main>;
}
