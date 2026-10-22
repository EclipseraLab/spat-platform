"use server";
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
  const { error } = await supabase.auth.signUp({ email, password, options: { data: { username, display_name: username } } });
  if (error) redirect("/signup?error=signup-failed");
  redirect("/dashboard?welcome=1");
}

export async function claimDailyCheckIn() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await supabase.rpc("claim_daily_check_in");
  if (error) redirect("/dashboard?checkin=error");
  const result = Array.isArray(data) ? data[0] : data;
  if (result?.claimed) redirect("/dashboard?checkin=success");
  redirect("/dashboard?checkin=wait");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
