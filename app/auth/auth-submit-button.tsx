"use client";

import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export default function AuthSubmitButton({ idleLabel, pendingLabel }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} aria-live="polite" aria-busy={pending}>
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
