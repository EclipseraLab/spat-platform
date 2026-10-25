"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
        theme?: "light" | "dark" | "auto";
      }) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_ID = "cloudflare-turnstile-script";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function Turnstile({ name = "turnstile_token" }: { name?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;
    let widgetId: string | undefined;
    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetId) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        callback: (value) => {
          setToken(value);
          window.dispatchEvent(new CustomEvent("spat-turnstile-verified", { detail: true }));
        },
        "expired-callback": () => {
          setToken("");
          window.dispatchEvent(new CustomEvent("spat-turnstile-verified", { detail: false }));
        },
        "error-callback": () => {
          setToken("");
          window.dispatchEvent(new CustomEvent("spat-turnstile-verified", { detail: false }));
        }
      });
    };

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (window.turnstile) {
      renderWidget();
    } else if (script) {
      script.addEventListener("load", renderWidget);
    } else {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", renderWidget);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      script?.removeEventListener("load", renderWidget);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      window.dispatchEvent(new CustomEvent("spat-turnstile-verified", { detail: false }));
    };
  }, []);

  if (!SITE_KEY) {
    return <p className="auth-field-help" role="alert">Security verification is not configured yet. Please try again later.</p>;
  }

  return (
    <div className="auth-turnstile">
      <div ref={containerRef} />
      <input type="hidden" name={name} value={token} readOnly />
      {!token && <p className="auth-field-help">Complete the security check to continue.</p>}
    </div>
  );
}
