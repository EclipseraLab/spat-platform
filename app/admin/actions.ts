"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin(role: "admin" | "reviewer" = "admin") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data, error } = await supabase.from("spat_admins").select("role").eq("user_id", user.id).maybeSingle();
  if (error || !data || (role === "admin" && data.role !== "admin")) redirect("/dashboard?notice=admin-only");
  return supabase;
}

export async function saveSocialTask(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const reward = Number(formData.get("reward_sp"));
  const active = formData.get("active") === "on";
  if (!/^[a-z0-9_]{3,40}$/.test(id) || title.length < 2 || title.length > 120 || description.length > 2000 || !Number.isInteger(reward) || reward < 1 || reward > 10000) redirect("/admin?tab=tasks&result=invalid");
  const supabase = await requireAdmin("admin");
  const { error } = await supabase.rpc("spat_admin_upsert_social_task", {
    p_id: id, p_title: title, p_description: description, p_reward_sp: reward, p_active: active
  });
  if (error) {
    console.error("Admin social task save failed:", error.message);
    redirect("/admin?tab=tasks&result=error");
  }
  revalidatePath("/admin");
  revalidatePath("/social-tasks");
  redirect("/admin?tab=tasks&result=saved");
}

export async function reviewSocialSubmission(formData: FormData) {
  const id = String(formData.get("submission_id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("review_note") ?? "").trim().slice(0, 1000);
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["approved", "rejected"].includes(decision)) redirect("/admin?tab=reviews&result=invalid");
  const supabase = await requireAdmin("reviewer");
  const { data, error } = await supabase.rpc("spat_admin_review_social_submission", {
    p_submission_id: id, p_decision: decision, p_review_note: note
  });
  if (error) {
    console.error("Admin submission review failed:", error.message);
    redirect("/admin?tab=reviews&result=error");
  }
  revalidatePath("/admin");
  revalidatePath("/social-tasks");
  const result = Array.isArray(data) ? data[0] : data;
  redirect("/admin?tab=reviews&result=" + (result?.success ? decision : "already_reviewed"));
}
