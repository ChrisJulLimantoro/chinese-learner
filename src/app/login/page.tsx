import { signIn, signUp } from "@/app/actions/auth";
import Seal from "@/components/Seal";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      {/* Decorative hanzi watermark */}
      <span
        aria-hidden
        className="hanzi fixed bottom-[-4rem] right-[-2rem] text-[22rem] font-bold leading-none select-none pointer-events-none opacity-[0.03] text-ink"
      >
        学
      </span>

      <div className="w-full max-w-sm relative z-10">
        {/* Brand mark */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Seal size={56} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Chinese Learner
          </h1>
          <p className="text-muted text-sm mt-2">
            Master Mandarin with spaced repetition
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl shadow-md border border-border p-8">
          <h2 className="font-semibold text-ink mb-6 text-center">
            Sign in to continue
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-seal/10 border border-seal/20 text-seal text-sm">
              {error}
            </div>
          )}
          {notice && (
            <div className="mb-4 p-3 rounded-xl bg-jade/10 border border-jade/20 text-jade text-sm">
              {notice}
            </div>
          )}

          <form className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">Email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                className="px-3.5 py-2.5 rounded-xl border border-border bg-paper focus:outline-none focus:ring-2 focus:ring-seal focus:border-transparent text-ink placeholder:text-faint transition-colors"
                placeholder="you@example.com"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">Password</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                minLength={6}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-paper focus:outline-none focus:ring-2 focus:ring-seal focus:border-transparent text-ink placeholder:text-faint transition-colors"
                placeholder="••••••••"
              />
            </label>

            <div className="flex flex-col gap-2.5 mt-2">
              <button
                type="submit"
                formAction={signIn}
                className="w-full px-4 py-3 rounded-xl bg-ink hover:bg-ink/90 transition-colors font-medium text-paper shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal"
              >
                Sign in
              </button>
              <button
                type="submit"
                formAction={signUp}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:bg-surface-2 transition-colors font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal"
              >
                Create account
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-faint mt-6 leading-relaxed">
            Progress is saved per account and synced across devices.
          </p>
        </div>
      </div>
    </div>
  );
}
