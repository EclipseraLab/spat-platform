"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function HomeSessionGuard() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    const routeMemberHome = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (active && user) router.replace("/dashboard");
    };

    void routeMemberHome();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session?.user) router.replace("/dashboard");
    });
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void routeMemberHome();
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [router]);

  return null;
}
