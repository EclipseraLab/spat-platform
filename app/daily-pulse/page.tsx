import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { submitWeeklyQuizAnswer, signOut } from "@/app/auth/actions";

type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answered: boolean;
  points_awarded: number | null;
};

type QuizPageProps = { searchParams: Promise<{ result?: string; points?: string }> };

export default async function DailyPulsePage({ searchParams }: QuizPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/daily-pulse");

  const { data, error } = await supabase.rpc("get_weekly_quiz");
  // get_weekly_quiz returns a JSON object shaped as { week_start, questions: [...] }.
  // Accept the object and array forms defensively so an API response shape change
  // cannot crash the page when we call .map() or .filter().
  const payload = Array.isArray(data) ? data[0] : data;
  const rawQuestions = payload && typeof payload === "object" && "questions" in payload
    ? (payload as { questions?: unknown }).questions
    : payload;
  const quiz = (Array.isArray(rawQuestions) ? rawQuestions : []) as QuizQuestion[];
  const resultMessage: Record<string, string> = {
    correct: `Answer submitted. You earned ${Math.max(0, Number(params.points ?? 0))} SP.`,
    incorrect: "Answer submitted. This question is now locked until next week's set.",
    already: "You have already answered that question.",
    invalid: "Please select one of the available options.",
    error: "We couldn't submit that answer. Refresh and try again."
  };
  const resultTone = params.result === "correct" ? "success" : params.result ? "notice" : "";

  return <main className="auth-shell"><section className="auth-card pulse-card">
    <header className="pulse-appbar"><Link href="/" className="auth-brand">ϟ SPAT<span>.</span></Link><nav aria-label="Main navigation"><Link href="/dashboard">Overview</Link><Link href="/games">Games</Link><Link href="/missions">Missions</Link><Link className="current" href="/daily-pulse">Daily Pulse</Link><Link href="/social-tasks">Social tasks</Link></nav></header>
    <p className="auth-eyebrow">DAILY PULSE · WEEKLY CRYPTO QUIZ</p>
    <h1>Your crypto pulse.</h1>
    <p className="auth-copy">Answer five crypto questions assigned for your account this week. Correct answers earn 10 SP each; each question can be answered once.</p>
    {params.result && <p className={`pulse-feedback ${resultTone}`} role="status">{resultMessage[params.result] ?? "Your answer was processed."}</p>}
    {error ? <p className="auth-error">We couldn't load your quiz right now. Please refresh the page.</p> : quiz.length === 0 ? <p className="auth-copy">Your weekly quiz is not available yet. Please try again shortly.</p> : <>
      <div className="pulse-progress"><span>{quiz.filter(q => q.answered).length} of {quiz.length} answered</span><span>Up to 50 SP</span></div>
      {quiz.map((question, index) => <article className="pulse-question" key={question.id}>
        <div className="pulse-question-head"><span>QUESTION {index + 1} / {quiz.length}</span>{question.answered && <span className="pulse-answered">ANSWERED · +{question.points_awarded ?? 0} SP</span>}</div>
        <h2>{question.prompt}</h2>
        {question.answered ? <p className="pulse-locked">Your answer has been recorded. This question is locked for the rest of the week.</p> :
          <form action={submitWeeklyQuizAnswer} className="pulse-options">
            <input type="hidden" name="question_id" value={question.id} />
            {question.options.map((option, optionIndex) => <label className="pulse-option" key={optionIndex}>
              <input type="radio" name="selected_option" value={optionIndex} required />
              <span>{option}</span>
            </label>)}
            <button type="submit">Submit answer <span>→</span></button>
          </form>}
      </article>)}
    </>}
    <Link href="/dashboard" className="dashboard-link">← Back to your account dashboard</Link>
    <form action={signOut}><button className="secondary-button" type="submit">Sign out</button></form>
  </section>
  <style>{`
    .pulse-card{width:min(100%,680px)}
    .pulse-feedback{border:1px solid #5c4c2b;background:#2a2113;color:#f2d49a;border-radius:8px;padding:12px;font-size:12px;line-height:1.5}
    .pulse-feedback.success{border-color:#24503e;background:#10271f;color:#8cdbb2}
    .pulse-progress{display:flex;justify-content:space-between;color:#8eacd8;font:10px 'DM Mono',monospace;border:1px solid #25364e;background:#101c2e;padding:12px;border-radius:8px;margin:20px 0}
    .pulse-question{border:1px solid #253149;background:#0c121d;border-radius:11px;padding:17px;margin:13px 0}
    .pulse-question-head{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;color:#8eb8ff;font:9px 'DM Mono',monospace;letter-spacing:.7px}
    .pulse-answered{color:#83d8a9}
    .pulse-question h2{font:600 16px/1.4 'Space Grotesk',sans-serif;margin:14px 0}
    .pulse-options{display:grid;gap:8px}
    .pulse-option{display:flex;align-items:center;gap:10px;border:1px solid #28354a;background:#111a28;border-radius:8px;padding:11px;color:#c7d3e5;font-size:12px;line-height:1.5;cursor:pointer}
    .pulse-option:has(input:checked){border-color:#538bdf;background:#172a44}
    .pulse-option input{accent-color:#5797ff;flex:0 0 auto}
    .pulse-options button{display:flex;justify-content:space-between;align-items:center;border:1px solid #70a5ff55;border-radius:8px;background:linear-gradient(110deg,#5797ff,#3274ee);color:#fff;padding:12px 14px;margin-top:5px;font-size:12px;font-weight:600}
    .pulse-options button span{font-size:17px}
    .pulse-locked{font-size:11px;color:#8c9ab0;line-height:1.6;margin:0}
  `}</style>
  </main>;
}
