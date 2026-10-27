"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
async function adminClient(){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login?next=/admin/quests");const {data}=await supabase.from("spat_admins").select("role").eq("user_id",user.id).maybeSingle();if(data?.role!=="admin")redirect("/dashboard?notice=admin-only");return supabase;}
export async function saveMission(formData:FormData){const id=String(formData.get("id")||"").trim();const title=String(formData.get("title")||"").trim();const description=String(formData.get("description")||"").trim();const reward=Number(formData.get("reward_sp"));const active=formData.get("active")==="on";const destinationUrl=String(formData.get("destination_url")||"").trim();if(title.length<2||title.length>120||description.length>2000||(destinationUrl&&!destinationUrl.startsWith("https://"))||!Number.isInteger(reward)||reward<0||reward>10000)redirect("/admin/quests?result=invalid");const supabase=await adminClient();const {error}=await supabase.rpc("spat_admin_upsert_mission",{p_id:id||null,p_title:title,p_description:description,p_reward_sp:reward,p_active:active,p_starts_at:null,p_ends_at:null,p_destination_url:destinationUrl});if(error){console.error("Mission save failed",error.message);redirect("/admin/quests?result=error");}revalidatePath("/admin/quests");revalidatePath("/admin");redirect("/admin/quests?result=saved");}

export async function deleteMission(formData:FormData){
 const id=String(formData.get("id")||"").trim();
 if(!/^[0-9a-f-]{36}$/i.test(id))redirect("/admin?tab=quests&result=invalid");
 const supabase=await adminClient();
 const {error}=await supabase.rpc("spat_admin_delete_mission",{p_id:id});
 if(error){console.error("Mission delete failed",error.message);redirect("/admin?tab=quests&result="+(error.message.includes("mission_has_completions")?"delete_blocked":"error"));}
 revalidatePath("/admin");revalidatePath("/missions");redirect("/admin?tab=quests&result=deleted");
}
