import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { APP_NAME } from '../lib/appName'
import Avatar from './Avatar'
import { BookmarkIcon, HomeIcon, PlusIcon, UserIcon, UsersIcon } from './icons'

function RailLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}

function focusComposer() {
  const el = document.getElementById('post-composer')
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el?.focus()
}

export default function LeftNavRail() {
  const { user } = useAuth()

  return (
    <aside className="hidden lg:block lg:w-60 lg:shrink-0">
      <div className="sticky top-20 rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm">
        <nav className="mt-1 space-y-1">
          <RailLink to="/" icon={<HomeIcon className="h-5 w-5" />} label="Home" active />
          <RailLink to="/members" icon={<UsersIcon className="h-5 w-5" />} label="Members" />

          {user ? (
            <>
              <RailLink to="/profile" icon={<UserIcon className="h-5 w-5" />} label="Profile" />
              <RailLink to="/saved" icon={<BookmarkIcon className="h-5 w-5" />} label="Saved" />
              <button
                onClick={focusComposer}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <PlusIcon className="h-5 w-5" />
                New post
              </button>

              <Link
                to="/profile"
                className="mt-2 flex items-center gap-3 rounded-xl border-t border-slate-100 px-3 py-3 pt-4 transition hover:bg-slate-50"
              >
                <Avatar name={user.name} src={user.avatar_url} size="sm" />
                <span className="truncate text-sm font-semibold text-slate-900">{user.name}</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="mt-1 block rounded-xl bg-brand-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </aside>
  )
}
