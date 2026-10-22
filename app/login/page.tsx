import Link from "next/link";
import { signIn } from "@/app/auth/actions";
import AuthSubmitButton from "@/app/auth/auth-submit-button";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="auth-shell"><section className="auth-card">
    <Link href="/" className="auth-brand">ϟ SPAT<span>.</span></Link>
    <p className="auth-eyebrow">WELCOME BACK</p><h1>Pick up your momentum.</h1>
    <p className="auth-copy">Sign in to return to your SPAT space.</p>
    {error && <p className="auth-error" role="alert">{error === "missing-fields" ? "Enter your email and password." : "We couldn't sign you in. Check your details and try again."}</p>}
    <form action={signIn} className="auth-form">
      <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required placeholder="Your password" /></label>
      <AuthSubmitButton idleLabel="Sign in" pendingLabel="Signing you in…" />
    </form>
    <p className="auth-switch">New to SPAT? <Link href="/signup">Create an account</Link></p><Link className="auth-back" href="/">← Back to preview</Link>
  </section></main>;
}
