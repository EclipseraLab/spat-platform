"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthSessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    const redirectIfSignedIn = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (active && user) router.replace("/dashboard");
    };

    void redirectIfSignedIn();

    // Mobile browsers can restore the login page from the back-forward cache
    // without making a new server request, so re-check the session on restoration.
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void redirectIfSignedIn();
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      active = false;
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [router]);

  return null;
}
