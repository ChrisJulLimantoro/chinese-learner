import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import Seal from "@/components/Seal";

export const dynamic = "force-dynamic";

const HSK_LEVELS = [
  { level: 1, label: "HSK 1", description: "Complete beginner — ~150 words" },
  { level: 2, label: "HSK 2", description: "Elementary — ~300 words (recommended start)" },
  { level: 3, label: "HSK 3", description: "Intermediate — ~600 words" },
  { level: 4, label: "HSK 4", description: "Upper-intermediate — ~1,200 words" },
  { level: 5, label: "HSK 5", description: "Advanced — ~2,500 words" },
  { level: 6, label: "HSK 6", description: "Proficiency — ~5,000 words" },
];

export default async function SignupPage({
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

      <div className="w-full max-w-md relative z-10">
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
            Create your account
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

          <form className="flex flex-col gap-5">
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
                autoComplete="new-password"
                required
                minLength={6}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-paper focus:outline-none focus:ring-2 focus:ring-seal focus:border-transparent text-ink placeholder:text-faint transition-colors"
                placeholder="At least 6 characters"
              />
            </label>

            {/* HSK Level selector */}
            <fieldset>
              <legend className="text-sm font-medium text-ink mb-2">
                Starting HSK level
              </legend>
              <div className="flex flex-col gap-2">
                {HSK_LEVELS.map(({ level, label, description }) => (
                  <label
                    key={level}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border bg-paper hover:bg-surface-2 cursor-pointer has-[:checked]:border-seal has-[:checked]:bg-seal/5 transition-colors"
                  >
                    <input
                      type="radio"
                      name="hsk_level"
                      value={String(level)}
                      defaultChecked={level === 2}
                      className="mt-0.5 accent-seal"
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-ink">{label}</span>
                      <span className="text-xs text-faint">{description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Free tier notice */}
            <div className="p-3 rounded-xl bg-ochre/10 border border-ochre/20 text-ochre text-xs leading-relaxed">
              <strong>Free tier:</strong> 5 words and 3 study sessions (lifetime). The app
              runs on a limited AI budget — these caps let everyone try it fairly.
            </div>

            <button
              type="submit"
              formAction={signUp}
              className="w-full px-4 py-3 rounded-xl bg-ink hover:bg-ink/90 transition-colors font-medium text-paper shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal mt-1"
            >
              Create account
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-seal hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
