"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function verifyTurnstile(formData: FormData, redirectPath: "/login" | "/signup") {
  const token = String(formData.get("turnstile_token") ?? "");
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) redirect(`${redirectPath}?error=verification-required`);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      cache: "no-store"
    });
    const result = await response.json() as { success?: boolean; hostname?: string };
    if (!result.success || !result.hostname || !["spat-platform.vercel.app", "spat-platform-eclipsera-lab.vercel.app", "spat-platform-git-main-eclipsera-lab.vercel.app"].includes(result.hostname)) {
      redirect(`${redirectPath}?error=verification-failed`);
    }
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Turnstile verification request failed");
    redirect(`${redirectPath}?error=verification-failed`);
  }
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const requestedNext = String(formData.get("next") ?? "/dashboard");
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";
  if (!email || !password) redirect("/login?error=missing-fields");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=invalid-credentials");
  redirect(next);
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  if (!email || password.length < 10 || !/^[a-z0-9_]{3,24}$/.test(username)) redirect("/signup?error=invalid-input");
  await verifyTurnstile(formData, "/signup");
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

export async function claimDailyMission(formData: FormData) {
  const missionKey = String(formData.get("mission_key") ?? "");
  if (!["profile_complete", "daily_check_in", "weekly_quiz"].includes(missionKey)) {
    redirect("/missions?result=invalid");
  }
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login?next=/missions");
  const { data, error } = await supabase.rpc("claim_daily_mission", { p_mission_key: missionKey });
  if (error) {
    console.error("Daily mission claim failed:", error.message);
    redirect("/missions?result=error");
  }
  const result = Array.isArray(data) ? data[0] : data;
  revalidatePath("/missions");
  revalidatePath("/dashboard");
  if (result?.success) redirect("/missions?result=claimed&points=" + Number(result.points_awarded ?? 0));
  redirect("/missions?result=" + String(result?.reason ?? "error"));
}

export async function saveXProfile(formData: FormData) {
  const profileUrl = String(formData.get("x_profile_url") ?? "").trim();
  let parsed: URL;
  try { parsed = new URL(profileUrl); } catch { redirect("/social-tasks?result=invalid_profile"); }
  const host = parsed.hostname.toLowerCase();
  const handle = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
  if (parsed.protocol !== "https:" || !["x.com","www.x.com","twitter.com","www.twitter.com"].includes(host) || !/^[A-Za-z0-9_]{1,15}$/.test(handle)) redirect("/social-tasks?result=invalid_profile");
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login?next=/social-tasks");
  if (user.user_metadata?.x_profile_url) redirect("/social-tasks?result=profile_already_saved");
  const { error } = await supabase.auth.updateUser({ data: { x_profile_url: "https://x.com/" + handle } });
  if (error) redirect("/social-tasks?result=profile_save_error");
  revalidatePath("/social-tasks");
  redirect("/social-tasks?result=profile_saved");
}

export async function submitSocialTask(formData: FormData) {
  const taskId = String(formData.get("task_id") ?? "");
  let proofUrl = String(formData.get("proof_url") ?? "").trim();
  if (!/^[a-z0-9_]{3,40}$/.test(taskId)) redirect("/social-tasks?result=invalid_task");
  const isTweetCampaign = taskId.startsWith("tweet_");
  if (isTweetCampaign && (!/^https:\/\/(www\.)?(x\.com|twitter\.com)\//i.test(proofUrl) || proofUrl.length > 2048)) redirect("/social-tasks?result=invalid_url");
  if (!isTweetCampaign && proofUrl) redirect("/social-tasks?result=invalid_url");
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login?next=/social-tasks");
  const xProfileUrl = user.user_metadata?.x_profile_url;
  if (typeof xProfileUrl !== "string" || !xProfileUrl) redirect("/social-tasks?result=profile_required");
  if (!isTweetCampaign) proofUrl = xProfileUrl;
  const { data, error } = await supabase.rpc("submit_social_task", {
    p_task_id: taskId,
    p_proof_url: proofUrl
  });
  if (error) {
    console.error("Social task submission failed:", error.message);
    redirect("/social-tasks?result=error");
  }
  const result = Array.isArray(data) ? data[0] : data;
  revalidatePath("/social-tasks");
  if (result?.success) redirect("/social-tasks?result=submitted");
  redirect("/social-tasks?result=" + String(result?.reason ?? "error"));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
