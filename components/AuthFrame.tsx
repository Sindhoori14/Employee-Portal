export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-ink-700 p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent-600/30 blur-2xl" />
        <div className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-brand-600/30 blur-2xl" />
        <div className="relative w-fit"><img src="/logo.png" alt="ElevateIQ" className="h-10 w-auto" /></div>
        <div className="relative my-auto max-w-md">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">TeamFlow</p>
          <h2 className="text-4xl font-bold leading-tight">One calm place for tasks, reports and training.</h2>
          <p className="mt-4 text-white/70">Plan the week, finish the work, file your daily report and keep learning — all in one private workspace.</p>
          <ul className="mt-8 space-y-3 text-sm text-white/85">
            {['Tasks with a clear review flow', 'Daily reports before 6 PM', 'Day-wise training and quizzes', 'Live chat and notifications'].map((t) => (
              <li key={t} className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs">✓</span>{t}</li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/50">Your data stays on the company server. No screen recording. No tracking.</p>
      </div>
      <div className="flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><img src="/logo.png" alt="ElevateIQ" className="h-9 w-auto" /></div>
          {children}
        </div>
      </div>
    </div>
  );
}
