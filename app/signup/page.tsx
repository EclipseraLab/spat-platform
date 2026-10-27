import Link from "next/link";
import { signUp } from "@/app/auth/actions";
import AuthSubmitButton from "@/app/auth/auth-submit-button";
import Turnstile from "@/app/auth/turnstile";
import AuthSessionRedirect from "@/app/auth/auth-session-redirect";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="auth-shell"><AuthSessionRedirect /><section className="auth-card">
    <Link href="/" className="auth-brand">ϟ SPAT<span>.</span></Link>
    <p className="auth-eyebrow">START YOUR JOURNEY</p><h1>Show up. Stack points.</h1>
    <p className="auth-copy">Create your account. No wallet needed.</p>
    {error && <p className="auth-error" role="alert">{error === "invalid-input" ? "Use a 3–24 character username (letters, numbers, underscores) and a password of at least 10 characters." : error.startsWith("verification-") ? "Complete the security check and try again." : "We couldn't create your account. Check your details and try again."}</p>}
    <form action={signUp} className="auth-form">
      <label>Username<input name="username" type="text" minLength={3} maxLength={24} pattern="[A-Za-z0-9_]+" autoComplete="username" required placeholder="your_username" /></label>
      <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
      <label>Password<input name="password" type="password" minLength={10} autoComplete="new-password" required aria-describedby="signup-password-help" placeholder="At least 10 characters" /></label>
      <p id="signup-password-help" className="auth-field-help">Use at least 10 characters. A longer, unique password is recommended.</p>
      <Turnstile />
      <AuthSubmitButton idleLabel="Create account" pendingLabel="Creating your account…" />
    </form>
    <p className="auth-switch">Already a member? <Link href="/login">Sign in</Link></p>
    <Link className="auth-back" href="/">← Back to preview</Link>
  </section></main>;
}
