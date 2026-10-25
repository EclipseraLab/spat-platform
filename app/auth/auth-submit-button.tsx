"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export default function AuthSubmitButton({ idleLabel, pendingLabel }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const onVerification = (event: Event) => {
      setVerified((event as CustomEvent<boolean>).detail === true);
    };
    window.addEventListener("spat-turnstile-verified", onVerification);
    return () => window.removeEventListener("spat-turnstile-verified", onVerification);
  }, []);

  return (
    <button type="submit" disabled={pending || !verified} aria-live="polite" aria-busy={pending}>
      {pending ? (
        <>
          <span className="auth-spinner" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        <>
          {idleLabel} <span aria-hidden="true">→</span>
        </>
      )}
    </button>
  );
}
