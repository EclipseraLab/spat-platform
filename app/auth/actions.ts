"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/login?error=missing-fields");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=invalid-credentials");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  if (!email || password.length < 10 || !/^[a-z0-9_]{3,24}$/.test(username)) redirect("/signup?error=invalid-input");
  const supabase = await createClient();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://spat-platform.vercel.app").replace(/\/$/, "");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, display_name: username },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`
    }
  });
  if (error) redirect("/signup?error=signup-failed");
  if (!data.session) redirect("/signup?notice=check-email");
  redirect("/dashboard?welcome=1");
}

export async function claimDailyCheckIn() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login?next=/dashboard");

  const { data, error } = await supabase.rpc("claim_daily_check_in");
  if (error) {
    console.error("Daily check-in RPC failed:", error.message);
    redirect("/dashboard?checkin=error");
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result || typeof result.claimed !== "boolean") {
    console.error("Daily check-in RPC returned an unexpected result:", data);
    redirect("/dashboard?checkin=error");
  }

  revalidatePath("/dashboard");
  if (result.claimed) redirect("/dashboard?checkin=success");
  redirect("/dashboard?checkin=wait");
}

export async function submitWeeklyQuizAnswer(formData: FormData) {
  const questionId = String(formData.get("question_id") ?? "");
  const selectedOption = Number(formData.get("selected_option"));
  if (!/^[0-9a-f-]{36}$/i.test(questionId) || !Number.isInteger(selectedOption) || selectedOption < 0 || selectedOption > 3) {
    redirect("/daily-pulse?result=invalid");
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/daily-pulse");
  const { data, error } = await supabase.rpc("submit_weekly_quiz_answer", {
    p_question_id: questionId,
    p_selected_option: selectedOption
  });
  if (error) redirect("/daily-pulse?result=error");
  const result = Array.isArray(data) ? data[0] : data;
  if (result?.already_answered) redirect("/daily-pulse?result=already");
  redirect(`/daily-pulse?result=${result?.correct ? "correct" : "incorrect"}&points=${Number(result?.points_awarded ?? 0)}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
