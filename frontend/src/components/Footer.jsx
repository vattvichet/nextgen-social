import { Link } from 'react-router-dom'
import { APP_NAME } from '../lib/appName'

export default function Footer() {
  return (
    <footer className="relative mt-auto bg-[#f4f3ee]">
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-14 sm:px-8">
        <div className="flex flex-col justify-between gap-12 pb-12 md:flex-row md:gap-8">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-brand-600">
                <path d="M12 2L22 20H2L12 2Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <span className="text-lg font-bold tracking-tight text-slate-900">{APP_NAME}</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              A small social feed for sharing posts, photos, and comments with the people you follow.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="text-xs font-semibold tracking-widest text-slate-400">EXPLORE</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/" className="text-slate-600 transition hover:text-brand-600">
                    Feed
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-widest text-slate-400">LEGAL</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-slate-200 py-5 text-center font-mono text-[0.7rem] uppercase tracking-wider text-slate-400 sm:flex-row sm:justify-center sm:gap-3">
          <span>&copy; {new Date().getFullYear()} {APP_NAME}</span>
          {/* <span className="hidden sm:inline">&middot;</span>
          <span>Built with Laravel &amp; React</span> */}
          <span className="hidden sm:inline">&middot;</span>
          {/* <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            All systems operational
          </span> */}
        </div>
      </div>
    </footer>
  )
}
