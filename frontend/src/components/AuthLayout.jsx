import { APP_NAME } from '../lib/appName'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 sm:p-8">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl md:grid md:grid-cols-2">
        <div className="order-2 flex flex-col justify-center px-6 py-10 sm:px-10 md:order-1 md:py-14 lg:px-14">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              {title} <span aria-hidden>👋</span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <p className="mt-10 text-center text-[0.65rem] uppercase tracking-wider text-slate-300">
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
          </div>
        </div>

        <div className="order-1 relative h-48 overflow-hidden md:order-2 md:h-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-950 to-black" />
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex h-full flex-col justify-end p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-2 text-white">
              <svg viewBox="0 0 24 24" className="h-7 w-7">
                <path d="M12 2L22 20H2L12 2Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <span className="text-xl font-bold">{APP_NAME}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
              A small social feed for sharing posts, photos, and comments with the people you follow.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
